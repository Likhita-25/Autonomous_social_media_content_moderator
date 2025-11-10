import sys

text = sys.argv[1]

# Simple local mock logic
# Ikkada nuvvu Pony or llama model ni load cheyachu
negative_words = ["hate", "terrible", "useless", "scam", "worst"]
if any(word in text.lower() for word in negative_words):
    print("Negative")
else:
    print("Positive")
