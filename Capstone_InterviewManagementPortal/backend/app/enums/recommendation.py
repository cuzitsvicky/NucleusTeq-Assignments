from enum import Enum

# Enum for recommendation
class Recommendation(str, Enum):
    NEXT_ROUND = "NEXT_ROUND"
    SELECT = "SELECT"
    REJECT = "REJECT"
