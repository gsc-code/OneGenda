import openai
import tiktoken
from flask import Flask, render_template_string, request

openai.api_key = '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'
app = Flask(__name__)

def generate_text(prompt, model="gpt-4"):
    response = openai.ChatCompletion.create(
        model=model,
        messages=prompt
    )
    responses = [response['choices'][0]['message']['content'], response['usage']['total_tokens']]
    return responses

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        user_prompt = request.form["prompt"]
        prompt = [
            {"role": "user", "content": 'Your help schedule my tasks. Given my input, provide a logical output of when to do what, in the format a list of start time to end time, task, and brief 1 sentence summary of why its there.'},
            {"role": "user", "content": user_prompt}
        ]
        response = generate_text(prompt)
        response_text = response[0]
        token_count = response[1]
        return render_template_string("""
<!doctype html>
<html>
  <head>
    <title>GPT-4 BABYYY</title>
    <style>
      .token-count {
        position: fixed;
        top: 10px;
        right: 10px;
        font-size: 16px;
      }
    </style>
  </head>
  <body>
    <h1>Generated Response</h1>
    <p>{{ response_text }}</p>
    <a href="/">Try Again</a>
    <div class="token-count">Tokens used: {{ token_count }}</div>
  </body>
</html>
        """, response_text=response_text, token_count=token_count)
    else:
        return """
<!doctype html>
<html>
  <head>
    <title>GPT-4 BABYYY</title>
  </head>
  <body>
    <h1>Enter Prompt</h1>
    <form method="POST">
      <textarea name="prompt" rows="10" cols="50"></textarea>
      <br>
      <input type="submit" value="Send">
    </form>
  </body>
</html>
        """


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
