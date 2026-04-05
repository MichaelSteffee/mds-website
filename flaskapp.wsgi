import os

os.environ["OPENAI_API_KEY"] = "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"

import sys

# Add your project directory to sys.path
sys.path.insert(0, "/var/www/mds-website")

from app import app as application
