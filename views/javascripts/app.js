/*jshint browser: true, jquery: true, camelcase: true, indent: 2, undef: true, quotmark: single, maxlen: 80, trailing: true, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, nonew: true, unused: true, strict: true*/ 
var socket = io(),
    userName;

function triviaViewModel() {

var self = this;

    self.right = ko.obeservable();
    self.wrong = ko.observable();
    self.question = ko.observable();
    self.answer = ko.observable();
    self.displayQuestion = ko.observable();
    self.addingQue = ko.observable();
    self.addQueDivId = ko.observable();
    self.user = ko.observable();
    self.allQuestion = ko.observable();
    self.scoreBtnId = ko.observable();
    self.letsPlayDiv = ko.observable();
    self.onlineUser = ko.observable();

self.letsPlay = function() {
    
    var url = "question";
    $.ajax({
        method: "GET",
        url: "http://localhost:3000/" + url,
        crossDomain: true,
        dataType: "json",
    }).done(function(msg) {
        if (msg.answer === false) {
            msg.answer = "false";
        }
        self.allQuestion(true);
        self.scoreBtnId(true);
        self.addingQue(true);
        self.addQueDivId(false);
        self.letsPlayDiv(false);
        self.displayQuestion(true);
        self.onlineUser(true);
    });
};
self.getScore = function() {
    
    $("#scoreDisplayId").show();
    var url = "score";
    $.ajax({
        method: "GET",
        url: "http://localhost:3000/" + url,
        crossDomain: true,
        dataType: "json"
    }).done(function(msg) {
        if (msg.answer === false) {
            msg.answer = "false";
        }
        self.right(msg.right);
        self.wrong(msg.wrong);
    });
};
self.postQuestion = function() {
    
    var url = "question";
   
    var data = {
        "question": self.question,
        "answer": self.answer
    };
    var dataJSON = JSON.stringify(data);
    $.ajax({
        method: "POST",
        url: "http://localhost:3000/" + url,
        crossDomain: true,
        dataType: "json",
        data: data
    }).done(function(msg) {
        if (msg.answer === false) {
            msg.answer = "false";
        }
        self.displayQuestion(true);
        self.addingQue(true);
        self.addQueDivId(false);
        self.user(false);
    });
};


 self.addingQueEvent=function(){
        self.addQueDivId(true);
        self.displayQuestion(false);
        self.addingQue(false);
        self.letsPlay(false);
        self.user(false);
        self.answer(null);
    }


self.main = function() {
   
   
    self.divScore = false;
    self.displayQuestion = false;
    self.onlineUser = false;

}

    self.letsPlay = function() {
        $('img').hide();
        console.log("Game has started");
        self.divScore = true;
        self.userName = self.user;
        self.currentUserId = self.userName;

        console.log("Current user: " + self.userName);
        self.letsPlay();
        socket.emit('play', self.userName);
    }

    socket.on('newQue', function(question) {
        self.question = question.question;
        self.questionAsked = question._id;
        self.answerAsked = question.answer;
        $('#' + userName).css("color", "black");
    });

    self.sendBtnEven = function() {
        socket.emit('score', {
            questionId: $('#questionAsked').val(),
            givenAns: $('#answer').val(),
            actualAns: $('#answerAsked').val()
        });
    }
}
ko.applybindings(new triviaViewModel());



    socket.on('play', function(name) {
        var item;
        $('#currentUser').val(name);
        userName = name;
        item = $('<textarea class="ui olive label" id="' + name + '">').text(name);
        $('#onlineUser').append(item);
    });
    
    
    /*('#nextQuestion').on('click', function() {
        $('#answer').val('');
        letsPlay();
    });*/
    socket.on('score', function(data) {
        $('#correctAns').val(data.right);
        $('#wrongAns').val(data.wrong);
        if (data.flag == 1) {
            if ($('#currentUser').val() == $('#' + userName + '').text()) {
                $('#' + userName + '').css("color", "#33D166");
            }
        }
        if (data.flag == 0) {
            if ($('#currentUser').val() == $('#' + userName + '').text()) {
                $('#' + userName + '').css("color", "#F1492A");
            }
        }
    });
    /*$("#addingQue").on('click', function() {
        $("#addQueDivId").show();
        $("#displayQuestion").hide();
        $("#addingQue").hide();
        $("#letsPlay").hide();
        $("#user").hide();
    });
    $("#submitBtnId").on('click', function() {
        postQuestion();
    });*/
};
$(document).ready(main);