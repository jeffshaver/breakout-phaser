const game = new Phaser.Game(480, 320, Phaser.AUTO, null, {
  preload,
  create,
  update
})
const textStyle = {
  font: '18px Arial',
  fill: '#0095DD'
}
const brickInfo = {
  width: 50,
  height: 20,
  count: {
    row: 7,
    col: 3
  },
  offset: {
    top: 50,
    left: 60
  },
  padding: 10
}

let worldCenterX
let worldCenterY
let ball
let paddle
let bricks
let score = 0
let scoreText
let lives = 3
let livesText
let lifeLostText
let paused = true
let startButton

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
  game.stage.backgroundColor = '#2b2b2b'
  game.load.image('ball', 'img/ball.png')
  game.load.image('paddle', 'img/paddle.png')
  game.load.image('brick', 'img/brick.png')
  game.load.spritesheet('ball', 'img/wobble.png', 20, 20)
  game.load.spritesheet('button', 'img/button.png', 120, 40)
}

function create() {
  worldCenterX = game.world.width * 0.5
  worldCenterY = game.world.height * 0.5

  game.physics.startSystem(Phaser.Physics.ARCADE)

  ball = game.add.sprite(50, 250, 'ball')
  ball.animations.add('wobble', [0, 1, 0, 2, 0, 1, 0, 2, 0], 24)
  ball.anchor.set(0.5)
  game.physics.enable(ball, Phaser.Physics.ARCADE)
  ball.body.collideWorldBounds = true
  ball.checkWorldBounds = true
  ball.events.onOutOfBounds.add(ballLeftScreen, this)
  game.physics.arcade.checkCollision.down = false
  ball.body.bounce.set(1)

  paddle = game.add.sprite(worldCenterX, game.world.height - 5, 'paddle')
  paddle.anchor.set(0.5, 1)
  game.physics.enable(paddle, Phaser.Physics.ARCADE)
  paddle.body.immovable = true

  initBricks()

  scoreText = game.add.text(5, 5, 'Points: ' + score, textStyle)

  livesText = game.add.text(
    game.world.width - 5,
    5,
    'Lives: ' + lives,
    textStyle
  )
  livesText.anchor.set(1, 0)

  lifeLostText = game.add.text(
    worldCenterX,
    worldCenterY,
    'Life Lost; click to continue',
    textStyle
  )
  lifeLostText.anchor.set(0.5)
  lifeLostText.visible = false

  createStartButton()
}

function update() {
  game.physics.arcade.collide(ball, paddle, ballHitPaddle)
  game.physics.arcade.collide(ball, bricks, ballHitBrick)

  if (paused) {
    return
  }

  paddle.x = game.input.x || worldCenterX
}

function initBricks() {
  bricks = game.add.group()

  for (let c = 0; c < brickInfo.count.col; c++) {
    for (let r = 0; r < brickInfo.count.row; r++) {
      const brickX =
        r * (brickInfo.width + brickInfo.padding) + brickInfo.offset.left
      const brickY =
        c * (brickInfo.height + brickInfo.padding) + brickInfo.offset.top
      const newBrick = game.add.sprite(brickX, brickY, 'brick')

      game.physics.enable(newBrick, Phaser.Physics.ARCADE)
      newBrick.body.immovable = true
      newBrick.anchor.set(0.5)
      bricks.add(newBrick)
    }
  }
}

function ballHitPaddle(ball, brick) {
  ball.animations.play('wobble')
  ball.body.velocity.x = -1 * 5 * (paddle.x - ball.x)
}

function ballHitBrick(ball, brick) {
  const killTween = game.add.tween(brick.scale)

  ball.animations.play('wobble')

  killTween.to({ x: 0, y: 0 }, 200, Phaser.Easing.Linear.None)
  killTween.onComplete.addOnce(() => {
    brick.kill()
  })
  killTween.start()

  score += 10
  scoreText.setText('Points: ' + score)

  let count_alive = 0

  for (let i = 0; i < bricks.children.length; i++) {
    if (bricks.children[i].alive === true) {
      count_alive++
    }
  }

  if (count_alive === 0) {
    alert('You won the game, congratulations!')
    location.reload()
  }
}

function ballLeftScreen() {
  paused = true
  lives--

  if (lives) {
    livesText.setText('Lives: ' + lives)
    lifeLostText.visible = true
    ball.reset(worldCenterX, game.world.height - 25)
    paddle.reset(worldCenterX, game.world.height - 5)
    game.input.onDown.addOnce(_ => {
      lifeLostText.visible = false
      paused = false
      ball.body.velocity.set(150, -150)
    })

    return
  }

  createStartButton()
}

function startGame() {
  startButton.destroy()
  ball.body.velocity.set(150, -150)
  paused = false
}

function createStartButton() {
  startButton = game.add.button(
    worldCenterX,
    worldCenterY,
    'button',
    startGame,
    this,
    1,
    0,
    2
  )
  startButton.anchor.set(0.5)
  ball.reset(worldCenterX, game.world.height - 25)
}
