// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      password: string
    }
    meals: {
      id: string
      name: string
      description: string
      isDiet: string
      user_id: string
      created_at: string
    }
  }
}
