const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/User')

// helpers
const getUserByToken = require('../helpers/get-user-by-token')
const getToken = require('../helpers/get-token')
const createUserToken = require('../helpers/create-user-token')
const { imageUpload } = require('../helpers/image-upload')

module.exports = class UserController {
  static async register(req, res) {
    const name = req.body.name
    const email = req.body.email
    const phone = req.body.phone
    const password = req.body.password
    const confirmpassword = req.body.confirmpassword

    // validations
    if (!name) {
      res.status(422).json({ message: 'O nome é obrigatório!' })
      return
    }

    if (!email) {
      res.status(422).json({ message: 'O e-mail é obrigatório!' })
      return
    }

    if (!phone) {
      res.status(422).json({ message: 'O telefone é obrigatório!' })
      return
    }

    if (!password) {
      res.status(422).json({ message: 'A senha é obrigatória!' })
      return
    }

    if (!confirmpassword) {
      res.status(422).json({ message: 'A confirmação de senha é obrigatória!' })
      return
    }

    if (password != confirmpassword) {
      res
        .status(422)
        .json({ message: 'A senha e a confirmação precisam ser iguais!' })
      return
    }

    // check if user exists
    const userExists = await User.findOne({ email: email })

    if (userExists) {
      res.status(422).json({ message: 'Por favor, utilize outro e-mail!' })
      return
    }

    // create password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    // create user
    const user = new User({
      name: name,
      email: email,
      phone: phone,
      password: passwordHash,
    })

    try {
      const newUser = await user.save()

      await createUserToken(newUser, req, res)
    } catch (error) {
      res.status(500).json({ message: error })
    }
  }

  static async login(req, res) {
    const email = req.body.email
    const password = req.body.password

    if (!email) {
      res.status(422).json({ message: 'O e-mail é obrigatório!' })
      return
    }

    if (!password) {
      res.status(422).json({ message: 'A senha é obrigatória!' })
      return
    }

    // check if user exists
    const user = await User.findOne({ email: email })

    if (!user) {
      return res
        .status(422)
        .json({ message: 'Não há usuário cadastrado com este e-mail!' })
    }

    // check if password match
    const checkPassword = await bcrypt.compare(password, user.password)

    if (!checkPassword) {
      return res.status(422).json({ message: 'Senha inválida' })
    }

    await createUserToken(user, req, res)
  }

  static async checkUser(req, res) {
    let currentUser;

    console.log(req.headers.authorization)

    if (req.headers.authorization) {
      const token = getToken(req)
      const decoded = jwt.verify(token, 'secret_key')

      currentUser = await User.findById(decoded.id)

      currentUser.password = undefined
    } else {
      currentUser = null
    }

    res.status(200).send(currentUser)
  }

  static async getUserById(req, res) {
    const id = req.params.id

    const user = await User.findById(id)

    if (!user) {
      res.status(422).json({ message: 'Usuário não encontrado!' })
      return
    }

    res.status(200).json({ user })
  }

 static async editUser(req, res) {
  const token = getToken(req)
  const user = await getUserByToken(token)

  // Protege o acesso ao filename
  if (req.file) {
    user.image = req.file.filename
    // console.log(req.file.filename)
  }

  const name = req.body.name
  const email = req.body.email
  const phone = req.body.phone
  const password = req.body.password
  const confirmpassword = req.body.confirmpassword

  // validations
  if (!name) {
    return res.status(422).json({ message: 'O nome é obrigatório!' })
  }

  user.name = name

  if (!email) {
    return res.status(422).json({ message: 'O e-mail é obrigatório!' })
  }

  // check if user exists
  const userExists = await User.findOne({ email: email })

  if (user.email !== email && userExists) {
    return res.status(422).json({ message: 'Por favor, utilize outro e-mail!' })
  }

  user.email = email

  if (!phone) {
    return res.status(422).json({ message: 'O telefone é obrigatório!' })
  }

  user.phone = phone

  // check if password match (só se for enviado)
  if (password || confirmpassword) {
    if (password !== confirmpassword) {
      return res.status(422).json({ error: 'As senhas não conferem.' })
    } else if (password) {
      // creating password
      const salt = await bcrypt.genSalt(12)
      const passwordHash = await bcrypt.hash(password, salt)
      user.password = passwordHash
    }
  }

  try {
    // returns updated data
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: user },
      { new: true },
    )
    res.json({
      message: 'Usuário atualizado com sucesso!',
      data: updatedUser,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
}