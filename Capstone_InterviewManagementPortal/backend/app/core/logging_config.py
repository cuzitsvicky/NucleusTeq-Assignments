import logging
import sys

# Function to setup logging
def setup_logging():
    """
    Sets up the logging configuration for the application.

    Configures logging to output to both console (stdout) and a file named 'app.log'.
    The log level is set to INFO, and the format includes timestamp, log level, 
    logger name, and the log message.
    """
    # Basic logging configuration
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("app.log", encoding="utf-8"),
        ],
    )
