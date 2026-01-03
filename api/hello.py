import json

def handler(request):
    return (
        200,
        {"Content-Type": "application/json"},
        json.dumps({"status": "ok", "message": "Python API is live"})
    )
