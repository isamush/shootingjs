//enchantの初期化
enchant();


//HTML読み込み完了時に行う処理
window.onload = function() {
    var game = new Game(320, 320);
    game.fps=16;
    //画像の読み込み
    game.preload("Shooting1.png");
    game.preload("Shooting2.png");
    var  statusL = new Label();
    statusL.x = 200;
    statusL.y = 280;
    statusL.text = "status";

    var Chara = enchant.Class.create(enchant.Sprite, {

    // constructor
    initialize: function(){
                //スプライトの生成
        enchant.Sprite.call(this, 38, 40);
        this.image = game.assets["Shooting1.png"];
        this.scaleX = 0.5;
        this.scaleY = 0.5;
        this.hitcnt = 0;
    }
    } );
    ////////// End of class

    var Missile = enchant.Class.create(enchant.Sprite, {

    // constructor
    initialize: function(){
                //スプライトの生成
        enchant.Sprite.call(this,6 , 13);
        this.image = game.assets["Shooting2.png"];
//        this.scaleX = 0.2;
//        this.scaleY = 0.2;
    }
    
    } );
    ////////// End of class

    var Button = enchant.Class.create(Chara, {

    // constructor
    initialize: function(name, x, y, frame){
        Chara.call(this);
        this.x = x;
        this.y = y;
        this.frame = frame;
        this.name = name;
        this.pressed = false;
        this.cmd = null;

        this.addEventListener(Event.TOUCH_START, function(e){
            this.pressed = true;
            if (this.cmd != null)
                this.cmd.move();
            statusL.text = this.name + " pressed.";
        } );
        this.addEventListener(Event.TOUCH_END, function(e) {
            this.pressed = false;
            statusL.text = "status";
        });
        this.addEventListener(Event.TOUCH_MOVE, function(e) {
            this.pressed = false;
            statusL.text = "status";
        });
    },

    setCmd: function (cmd) {this.cmd = cmd;}
    } );
    ////////// End of class

    var Command = enchant.Class.create(Chara, {

    // constructor
    initialize: function(leftb, rightb, fireb){
        Chara.call(this);
        this.frame = 2;
        this.x = 140;
        this.y = 250;
        this.leftb = leftb;
        this.rightb = rightb;
        this.fireb = fireb;
        
        this.addEventListener(Event.ENTER_FRAME, function(e){
            this.move();
        } );

    },
    
     move: function(){
        if (this.frame == 6 
            && this.hitcnt ++ > 2) {
            titleScene = new TitleScene("Game Over", "Click here or Press Down key to restart");
            game.replaceScene(titleScene);           
        }
        else if (this.leftb.pressed && this.x > 0)
            this.x -= 5;
        else if (this.rightb.pressed && this.x < 300)
            this.x += 5;
       else if (this.fireb.pressed) {
            var m = new CmdMissile(this);
            cmdMisG.addChild(m); 
            this.fireb.pressed = false;
        }
       }

    } );
    ////////// End of class

    var Invader = enchant.Class.create(Chara, {

    // constructor
    initialize: function(x, y, dx){
        Chara.call(this);
        this.frame = 0;
        this.x = x;
        this.y = y;
        this.dx = dx;
        
        this.addEventListener(Event.ENTER_FRAME, function(e){
            this.move();
        } );

    },
    
     move: function(){
         if (this.frame == 6) {
             if (this.hitcnt ++ > 2) {
                invdG.removeChild(this);
                if (invdG.childNodes.length == 0) {
                    titleScene = new TitleScene("Congratulation, you won!", "Click here or Press Down key to play again");
                    game.replaceScene(titleScene);                           
                }
             }
         } else {
             this.frame = this.age % 2;
             if (this.x < 3 ||this.x > 295) {
                 this.y += 25;
                 this.dx *= -1;
             }
             this.x += this.dx;
            if (this.y > 260) {
                invdG.removeChild(this);
            }
            if (this.y < 200) {
                if (Math.random()* 100 < 2) {
                var m = new InvMissile(this);
                invdMisG.addChild(m); 

                }
            }
         }
       }

    } );
    ////////// End of class

    var CmdMissile = enchant.Class.create(Missile, {

    // constructor
    initialize: function(cmd){
        Missile.call(this);
        this.frame = 1;
        this.x = cmd.x + 6;
        this.y = cmd.y - 20;
        
        this.addEventListener(Event.ENTER_FRAME, function(e){
            this.move();
        } );

    },
    
     move: function(){
         this.y -= 10;

         var invds = invdG.childNodes;
         for (var i = 0; i < invds.length ; ++i) {
             if (this.intersect(invds[i])) {
                 invds[i].frame = 6;
                cmdMisG.removeChild(this); 
                return;
             }
         }
        if (this.y < 5)
            cmdMisG.removeChild(this); 
        }

    } );
    ////////// End of class
    
    var InvMissile = enchant.Class.create(Missile, {

    // constructor
    initialize: function(chara){
        Missile.call(this);
        this.frame = 0;
        this.x = chara.x + 6;
        this.y = chara.y + 20;
        
        this.addEventListener(Event.ENTER_FRAME, function(e){
            this.move();
            this.collision();
        } );
        
        this.addEventListener(Event.EXIT_FRAME, function(e){
            this.collision();
        } );

    },
    
     move: function(){
         this.y += 5;
        if (this.y > 275)
            invdMisG.removeChild(this); 
        },

    collision: function(){
        if (this.intersect(cmd)) {
            invdMisG.removeChild(this);
            cmd.frame = 6;
        }   
        }

    } );
    ////////// End of class

    var GameScene = enchant.Class.create(enchant.Scene, {

    // constructor
    initialize: function(chara){
        Scene.call(this);
        var bgGame = new Sprite(320, 320);
        invdG = new Group();
        
        cmdMisG = new Group();
        invdMisG = new Group();
        
        this.addChild(bgGame); 
        for (var i=5; i < 200; i += 30) {
            var invd1 = new Invader(i, 5, 3);
            invdG.addChild(invd1); 
        }

        for (var i=280; i > 50; i -= 30) {
            var invd1 = new Invader(i, 20, -3);
            invdG.addChild(invd1); 
        }

        var leftb = new Button("Left", 10, 280, 3);
        var fireb = new Button("Fire", 32, 280, 5);
        var rightb = new Button("Right", 56, 280, 4);
        
        cmd = new Command(leftb, rightb, fireb);
        leftb.setCmd(cmd);
        rightb.setCmd(cmd);
        fireb.setCmd(cmd);

        this.addEventListener(Event.LEFT_BUTTON_DOWN, function(e){
            leftb.pressed = true;
            rightb.pressed = false;
            cmd.move();
        } );

        this.addEventListener(Event.LEFT_BUTTON_UP, function(e){
            leftb.pressed = false;
        } );

        this.addEventListener(Event.RIGHT_BUTTON_DOWN, function(e){
            rightb.pressed = true;
            leftb.pressed = false;
            cmd.move();
        } );

        this.addEventListener(Event.RIGHT_BUTTON_UP, function(e){
            rightb.pressed = false;
        } );

        this.addEventListener(Event.UP_BUTTON_DOWN, function(e){
            fireb.pressed = true;
            cmd.move();
        } );

        this.addEventListener(Event.UP_BUTTON_UP, function(e){
            fireb.pressed = false;
        } );

//表示オブジェクトツリーに追加
        this.addChild(invdG); 
        this.addChild(cmdMisG); 
        this.addChild(invdMisG); 

        this.addChild(cmd); 
        this.addChild(fireb); 
        this.addChild(rightb); 
        this.addChild(leftb); 

        this.addChild(statusL); 
  
    }
    } );
    ////////// End of class

    var TitleScene = enchant.Class.create(enchant.Scene, {

    // constructor
    initialize: function(title, startMsg){
        Scene.call(this);

        var bgTitle = new Sprite(320, 320);

        var inv1 = new Chara();
        inv1.x = 100; inv1.y = 50; inv1.frame = 0;
        
        var inv2 = new Chara();
        inv2.x = 150; inv2.y = 50; inv2.frame = 1;
        
        var chara3 = new Chara();
        chara3.x = 200; chara3.y = 50; chara3.frame = 2;
        
        var msgL = Label();
        msgL.text = title;
        msgL.x = 100;
        msgL.y = 100;
       
       var descL1 = Label();
       var descL2 = Label();
       var descL3 = Label();
       var descL4 = Label();
       var descL5 = Label();
        descL1.text = "The commands:";
        descL2.text = "Up    Key: to fire missile";
        descL3.text = "Left  Key: to left";
        descL4.text = "Right Key: to right";
        descL5.text = "Down  Key: to start game";

        descL1.x = 100; descL1.y = 120;
        descL2.x = 120; descL2.y = 135;
        descL3.x = 120; descL3.y = 150;
        descL4.x = 120; descL4.y = 165;
        descL5.x = 120; descL5.y = 180;
       
        var playL = Label();
        playL.text = startMsg;
        playL.x = 70;
        playL.y = 200;

        playL.addEventListener(Event.TOUCH_START, function(e){
            this.parentNode.startPlaying();
        } );
        
        this.addEventListener(Event.DOWN_BUTTON_DOWN, function(e){
            this.startPlaying();
        } );
        
        this.addChild(bgTitle);
        this.addChild(inv1);
        this.addChild(inv2);
        this.addChild(chara3);
        this.addChild(msgL);
        this.addChild(playL);
        this.addChild(descL1);
        this.addChild(descL2);
        this.addChild(descL3);
        this.addChild(descL4);
        this.addChild(descL5);
  
    },
    
    startPlaying: function(e){
            gameScene = new GameScene();
            game.replaceScene(gameScene);
            
    } 
    } );
    ////////// End of class

    var gameScene = null;
    var cmdMisG = null;
    var invdMisG = null;
    var invdG = null;
    var gameScene = null;
    var cmd = null;

    var titleScene = null;


    game.onload = function() {
        titleScene = new TitleScene("Welcome to Invader Game", "Click here or Press Down Key to start");
        game.pushScene(titleScene);
    };
    game.start();
};