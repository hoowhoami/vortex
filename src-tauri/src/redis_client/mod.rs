use redis::{Client, Commands, Connection, Value};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RedisValue {
    pub r#type: String,
    pub value: serde_json::Value,
    pub ttl: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RedisKey {
    pub key: String,
    pub r#type: String,
}

pub struct RedisConnectionManager {
    connections: Arc<Mutex<HashMap<String, Connection>>>,
}

impl RedisConnectionManager {
    pub fn new() -> Self {
        RedisConnectionManager {
            connections: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn connect(&self, id: String, host: &str, port: u16, password: Option<&str>, database: u8) -> Result<(), String> {
        let url = if let Some(pwd) = password {
            format!("redis://:{}@{}:{}/{}", pwd, host, port, database)
        } else {
            format!("redis://{}:{}/{}", host, port, database)
        };

        let client = Client::open(url).map_err(|e| e.to_string())?;
        let conn = client.get_connection().map_err(|e| e.to_string())?;

        let mut connections = self.connections.lock().unwrap();
        connections.insert(id, conn);

        Ok(())
    }

    pub fn disconnect(&self, id: &str) -> Result<(), String> {
        let mut connections = self.connections.lock().unwrap();
        connections.remove(id);
        Ok(())
    }

    pub fn select_database(&self, id: &str, database: u8) -> Result<(), String> {
        let mut connections = self.connections.lock().unwrap();
        let conn = connections.get_mut(id).ok_or("Connection not found")?;

        redis::cmd("SELECT")
            .arg(database)
            .query::<()>(conn)
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn get_keys(&self, id: &str, pattern: &str) -> Result<Vec<String>, String> {
        let mut connections = self.connections.lock().unwrap();
        let conn = connections.get_mut(id).ok_or("Connection not found")?;

        // Use SCAN instead of KEYS for better performance with large datasets
        let mut keys = Vec::new();
        let mut cursor: u64 = 0;
        let match_pattern = if pattern == "*" { None } else { Some(pattern) };

        loop {
            // Use match_count to limit batch size for better performance
            let (next_cursor, batch_keys): (u64, Vec<String>) = redis::cmd("SCAN")
                .arg(cursor)
                .arg("MATCH")
                .arg(match_pattern.unwrap_or("*"))
                .arg("COUNT")
                .arg(1000) // Process 1000 keys per batch
                .query(conn)
                .map_err(|e| e.to_string())?;

            keys.extend(batch_keys);

            cursor = next_cursor;
            if cursor == 0 {
                break;
            }

            // Safety limit to prevent infinite loops
            if keys.len() > 100_000 {
                break;
            }
        }

        Ok(keys)
    }

    pub fn get_keys_with_type(&self, id: &str, pattern: &str) -> Result<Vec<RedisKey>, String> {
        let mut connections = self.connections.lock().unwrap();
        let conn = connections.get_mut(id).ok_or("Connection not found")?;

        // Use SCAN instead of KEYS for better performance with large datasets
        let mut keys = Vec::new();
        let mut cursor: u64 = 0;
        let match_pattern = if pattern == "*" { None } else { Some(pattern) };

        loop {
            let (next_cursor, batch_keys): (u64, Vec<String>) = redis::cmd("SCAN")
                .arg(cursor)
                .arg("MATCH")
                .arg(match_pattern.unwrap_or("*"))
                .arg("COUNT")
                .arg(1000)
                .query(conn)
                .map_err(|e| e.to_string())?;

            keys.extend(batch_keys);

            cursor = next_cursor;
            if cursor == 0 {
                break;
            }

            // Safety limit
            if keys.len() > 100_000 {
                break;
            }
        }

        if keys.is_empty() {
            return Ok(Vec::new());
        }

        // Use pipeline to batch TYPE commands for better performance
        let mut pipe = redis::pipe();
        for key in &keys {
            pipe.cmd("TYPE").arg(key);
        }

        // Execute all TYPE commands at once
        let types: Vec<String> = pipe
            .query(conn)
            .map_err(|e| e.to_string())?;

        // Combine keys with their types
        let result = keys
            .into_iter()
            .zip(types.into_iter())
            .map(|(key, key_type)| RedisKey {
                key,
                r#type: key_type,
            })
            .collect();

        Ok(result)
    }

    pub fn get_value(&self, id: &str, key: &str) -> Result<RedisValue, String> {
        let mut connections = self.connections.lock().unwrap();
        let conn = connections.get_mut(id).ok_or("Connection not found")?;

        // Get key type
        let key_type: String = redis::cmd("TYPE")
            .arg(key)
            .query(conn)
            .map_err(|e| e.to_string())?;

        // Get TTL
        let ttl: i64 = conn.ttl(key).map_err(|e| e.to_string())?;
        let ttl_value = if ttl == -1 || ttl == -2 { None } else { Some(ttl) };

        // Get value based on type
        let value = match key_type.as_str() {
            "string" => {
                let val: String = conn.get(key).map_err(|e| e.to_string())?;
                serde_json::Value::String(val)
            }
            "list" => {
                let val: Vec<String> = conn.lrange(key, 0, -1).map_err(|e| e.to_string())?;
                serde_json::to_value(val).unwrap_or(serde_json::Value::Null)
            }
            "set" => {
                let val: Vec<String> = conn.smembers(key).map_err(|e| e.to_string())?;
                serde_json::to_value(val).unwrap_or(serde_json::Value::Null)
            }
            "zset" => {
                let val: Vec<(String, f64)> = conn.zrange_withscores(key, 0, -1).map_err(|e| e.to_string())?;
                serde_json::to_value(val).unwrap_or(serde_json::Value::Null)
            }
            "hash" => {
                let val: HashMap<String, String> = conn.hgetall(key).map_err(|e| e.to_string())?;
                serde_json::to_value(val).unwrap_or(serde_json::Value::Null)
            }
            _ => serde_json::Value::Null,
        };

        Ok(RedisValue {
            r#type: key_type,
            value,
            ttl: ttl_value,
        })
    }

    pub fn set_value(&self, id: &str, key: &str, value_type: &str, value: serde_json::Value) -> Result<(), String> {
        let mut connections = self.connections.lock().unwrap();
        let conn = connections.get_mut(id).ok_or("Connection not found")?;

        match value_type {
            "string" => {
                let val = value.as_str().ok_or("Invalid string value")?;
                conn.set(key, val).map_err(|e| e.to_string())?;
            }
            "list" => {
                let values: Vec<String> = serde_json::from_value(value).map_err(|e| e.to_string())?;
                // Delete existing key first
                let _: () = conn.del(key).map_err(|e| e.to_string())?;
                // Push all values
                for val in values {
                    conn.rpush(key, val).map_err(|e| e.to_string())?;
                }
            }
            "set" => {
                let values: Vec<String> = serde_json::from_value(value).map_err(|e| e.to_string())?;
                let _: () = conn.del(key).map_err(|e| e.to_string())?;
                for val in values {
                    conn.sadd(key, val).map_err(|e| e.to_string())?;
                }
            }
            "zset" => {
                let values: Vec<(String, f64)> = serde_json::from_value(value).map_err(|e| e.to_string())?;
                let _: () = conn.del(key).map_err(|e| e.to_string())?;
                for (member, score) in values {
                    conn.zadd(key, member, score).map_err(|e| e.to_string())?;
                }
            }
            "hash" => {
                let values: HashMap<String, String> = serde_json::from_value(value).map_err(|e| e.to_string())?;
                let _: () = conn.del(key).map_err(|e| e.to_string())?;
                for (field, val) in values {
                    conn.hset(key, field, val).map_err(|e| e.to_string())?;
                }
            }
            _ => return Err("Unsupported type".to_string()),
        }

        Ok(())
    }

    pub fn delete_key(&self, id: &str, key: &str) -> Result<(), String> {
        let mut connections = self.connections.lock().unwrap();
        let conn = connections.get_mut(id).ok_or("Connection not found")?;

        conn.del(key).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn execute_command(&self, id: &str, command: &str) -> Result<String, String> {
        let mut connections = self.connections.lock().unwrap();
        let conn = connections.get_mut(id).ok_or("Connection not found")?;

        let parts: Vec<&str> = command.split_whitespace().collect();
        if parts.is_empty() {
            return Err("Empty command".to_string());
        }

        let mut cmd = redis::cmd(parts[0]);
        for arg in &parts[1..] {
            cmd.arg(*arg);
        }

        let result: Value = cmd.query(conn).map_err(|e| e.to_string())?;
        Ok(format!("{:?}", result))
    }

    pub fn test_connection(host: &str, port: u16, password: Option<&str>) -> Result<bool, String> {
        let url = if let Some(pwd) = password {
            format!("redis://:{}@{}:{}", pwd, host, port)
        } else {
            format!("redis://{}:{}", host, port)
        };

        let client = Client::open(url).map_err(|e| e.to_string())?;
        let mut conn = client.get_connection().map_err(|e| e.to_string())?;

        // Test with PING command
        let pong: String = redis::cmd("PING")
            .query(&mut conn)
            .map_err(|e| e.to_string())?;

        Ok(pong == "PONG")
    }
}
