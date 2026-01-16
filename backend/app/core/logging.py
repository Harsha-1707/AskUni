import logging
import sys
import json
from datetime import datetime
from pythonjsonlogger import jsonlogger

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        log_record['timestamp'] = datetime.utcnow().isoformat()
        log_record['level'] = record.levelname
        log_record['logger'] = record.name

def setup_logging():
    # Console handler with JSON formatting
    console_handler = logging.StreamHandler(sys.stdout)
    console_formatter = CustomJsonFormatter(
        '%(timestamp)s %(level)s %(name)s %(message)s'
    )
    console_handler.setFormatter(console_formatter)
    console_handler.setLevel(logging.INFO)

    # File handler for all logs
    file_handler = logging.FileHandler('logs/app.log')
    file_handler.setFormatter(console_formatter)
    file_handler.setLevel(logging.INFO)

    # Error file handler
    error_handler = logging.FileHandler('logs/errors.log')
    error_handler.setFormatter(console_formatter)
    error_handler.setLevel(logging.ERROR)

    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(error_handler)

    return root_logger

logger = setup_logging()
