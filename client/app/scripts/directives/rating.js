'use strict';

angular.module('clientApp')
  .directive('rating', function (Webapi) {
    return {

      templateUrl: 'views/directives/rating.html',

      restrict: 'E',

      link: function postLink(scope, element, attrs) {

        var videoId = attrs.videoid;

        scope.rating = null;

        Webapi.rating(videoId, function(ratings) {

          if (ratings) {

            var findQuestion = function(tag, questions) {
              for (var i=0; i < questions.length; i++) {
                if (questions[i].tag === tag) {
                  return questions[i];
                }
              }
              return {};
            };


            Webapi.allQuestion(function(questions) {

              var ratingArray = [];

              ratings.forEach(function(r, index) {
                var q = findQuestion(r.tag, questions);

                q.rating = r;

                // q.options[i].tagにタグ
                // q.options[i].jpにoptionが入っている

                // q.rating.ratingにタグが入っている
                // q.rating.selectedOptionsにtagの配列

                ratingArray[index] = q;
              });

              ratingArray.sort(function(l, r) {
                return (l.index - r.index);
              });

              scope.rating = ratingArray;

              scope.optionByTag = function(tag, options) {

                var language='jp';

                for (var i=0; i < options.length; i++) {
                  if (tag === options[i].tag) {
                    return options[i][language];
                  }
                }

                // もしタグから質問事項が見つからなかったらtagを返す
                // text入力の質問に対してはこれでOK
                return tag;
              };

            });

          }

        });

      }

    };

  });
