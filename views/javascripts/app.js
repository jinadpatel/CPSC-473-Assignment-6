/*jshint browser: true, jquery: true, camelcase: true, indent: 2, undef: true, quotmark: single, maxlen: 80, trailing: true, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, nonew: true, unused: true, strict: true*/ 
var letsPlay = function() {
    'use strict';
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
        $("#allQuestion").show();
        $("#scoreBtnId").show();
        $("#addingQue").show();
        $("#addQueDivId").hide();
        $("#letsPlayDiv").hide();
        $('#displayQuestion').show();
        $('#onlineUser').show();
    });
};
var getScore = function() {
    'use strict';
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
        $("#rightId").val(msg.right);
        $("#wrongId").val(msg.wrong);
    });
};
var postQuestion = function() {
    'use strict';
    var url = "question";
    var question = $("#questionId").val();
    var answer = $("#answerId").val();
    var data = {
        "question": question,
        "answer": answer
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
        $("#displayQuestion").show();
        $("#addingQue").show();
        $("#addQueDivId").hide();
        $("#user").hide();
    });
};
var main = function() {
    'use strict';
    var socket = io(),
        userName;
    $('#divScore').hide();
    $('#displayQuestion').hide();
    $('#onlineUser').hide();
    $("#letsPlay").on('click', function() {
        $('img').hide();
        console.log("Game has started");
        $('#divScore').show();
        letsPlay();
        socket.emit('play', $('#user').val());
    });
    socket.on('play', function(name) {
        var item;
        $('#currentUser').val(name);
        userName = name;
        item = $('<textarea class="ui olive label" id="' + name + '">').text(name);
        $('#onlineUser').append(item);
    });
    socket.on('newQue', function(question) {
        $('#question').val(question.question);
        $('#questionAsked').val(question._id);
        $('#answerAsked').val(question.answer);
        $('#' + userName).css("color", "black");
    });
    $('#sendBtn').on('click', function() {
        socket.emit('score', {
            questionId: $('#questionAsked').val(),
            givenAns: $('#answer').val(),
            actualAns: $('#answerAsked').val()
        });
    });
    $('#nextQuestion').on('click', function() {
        $('#answer').val('');
        letsPlay();
    });
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
    $("#addingQue").on('click', function() {
        $("#addQueDivId").show();
        $("#displayQuestion").hide();
        $("#addingQue").hide();
        $("#letsPlay").hide();
        $("#user").hide();
    });
    $("#submitBtnId").on('click', function() {
        postQuestion();
    });
};
$(document).ready(main);