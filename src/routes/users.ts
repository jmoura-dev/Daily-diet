import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { hash } from 'bcrypt'
import { checkSessionIdExists } from '../middlewares/check-sessionId-exists'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const definitionSchemaUsers = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      res.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    const { name, email, password } = definitionSchemaUsers.parse(req.body)

    const checkEmailExists = await knex('users').where({ email }).first()

    if (checkEmailExists) {
      throw new Error('Este e-mail já está sendo usado.')
    }

    if (!name || !email || !password) {
      throw new Error('[401] Preecha todos os campos para se registrar.')
    }

    const hashedPassword = await hash(password, 8)

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password: hashedPassword,
    })

    return res.status(201).send()
  })

  app.get(
    '/:userId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const createSchemaGetUsers = z.object({
        userId: z.string(),
      })

      const { userId } = createSchemaGetUsers.parse(req.params)

      const users = await knex('users').where({ id: userId }).first()
      const meals = await knex('meals').where({ user_id: userId })

      const mealsIsDiet = meals.filter((meal) => meal.isDiet === 'true')
      const mealsNotIsDiet = meals.filter((meal) => meal.isDiet === 'false')

      const amountOfMeals = meals.length
      const amountOfMealsIsDiet = mealsIsDiet.length
      const amountOfMealsNotIsDiet = mealsNotIsDiet.length

      return res.send({
        ...users,
        meals,
        amountOfMeals,
        amountOfMealsIsDiet,
        amountOfMealsNotIsDiet,
      })
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const createSchemaDeleteMeal = z.object({
        id: z.string(),
      })

      const { id } = createSchemaDeleteMeal.parse(req.params)

      const user = await knex('users').where({ id }).delete()

      if (!user) {
        throw new Error('Usuário não identificado.')
      }

      return res.status(200).send()
    },
  )
}
