import fastify from 'fastify'
import { env } from './env'
import { usersRoutes } from './routes/users'
import { mealRoutes } from './routes/diet'

const app = fastify()

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(mealRoutes, {
  prefix: 'meals',
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log(`HTTP Server Running on port: ${env.PORT}`)
  })
