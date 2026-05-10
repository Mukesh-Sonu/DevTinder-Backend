# DevTinder APIs

authRouter

- POST /signup
- POST /login
- POST /logout

profileRouter

- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

connectionRequestRouter
interested / ignored

- POST /request/send/:status/:userId
- POST /request/review/:status/:requestId

userRouter
GET /user/requests/received
GET /user/connections
GET /user/feed - GETS you the profile of other users on platform (paginated)
