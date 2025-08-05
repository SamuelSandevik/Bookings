use env_logger::Builder;
use log::LevelFilter;
use std::env;
use std::io::Write;

pub fn init_logger() {
    let env = env::var("RUST_LOG").unwrap_or_else(|_| "info".to_string());
    
    Builder::new()
        .format(|buf, record| {
            let level = record.level();
            let level_color = match level {
                log::Level::Error => "\x1b[31m", // Red
                log::Level::Warn => "\x1b[33m",  // Yellow
                log::Level::Info => "\x1b[32m",  // Green
                log::Level::Debug => "\x1b[36m", // Cyan
                log::Level::Trace => "\x1b[35m", // Magenta
            };
            
            writeln!(
                buf,
                "{}[{}] {}\x1b[0m {}",
                level_color,
                level,
                chrono::Local::now().format("%Y-%m-%d %H:%M:%S"),
                record.args()
            )
        })
        .filter(None, LevelFilter::Info)
        .parse_env(&env)
        .init();
} 