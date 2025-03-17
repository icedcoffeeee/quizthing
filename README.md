# QuizThing

An open-source self-host alternative to ItemPool.

## Requirements

1. docker & docker compose
1. npm & bun

## Running

```bash
git clone https://github.com/icedcoffeeee/quizthing
cd quizthing
docker compose pull
docker compose up -d
bun db:push
bun run auth
# vv new terminal instance
bun run build
bun start
```

Then, the website is live at `http://localhost:3000`. Connect to the same
network at `http://{ your ip }:3000`. Feel free to port-forward for WAN use.

[!NOTE] the authentication process is currently unstable, the confirmation code
is not delivered to emails, but logged to console.

## Usage
- Create a new quiz
    - Add questions
    - Add answers, select correct one
    - Start quiz by pressing play button
- Join quiz with the displayed code
    - Admin reveals questions and answers by pressing the question number
    - Number of people answered will update live

## Todo

- [ ] add media support (images, videos)
- [ ] add KaTeX support (math)

## Contributing

- Open an issue
- Let me approve feature additions before opening pull request
- Don't be rude

## License

MIT
