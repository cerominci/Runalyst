import json
from app.core.aws_client import sqs_client, SQS_QUEUE_URL

def send_message_to_queue(message_body: dict):
    return sqs_client.send_message(
        QueueUrl=SQS_QUEUE_URL,
        MessageBody=json.dumps(message_body)
    )