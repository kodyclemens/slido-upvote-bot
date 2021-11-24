# Slido Upvote Bot

<img src="./img/baby-unicorn-purge.png" width="200">

Upvotes a question on Slido X amount of times.

## Usage

1. Install and use latest LTS of Node v16
2. Clone repo, run `yarn install` in project directory
3. Run `node index.js {event_id} {#_times_to_upvote}`

If the link below was a valid Slido event, the `event_id` would be `abc123`
`https://app.sli.do/event/abc123/live/questions`

Example usage: `node index.js abc123 10`
