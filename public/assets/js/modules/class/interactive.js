'use strict';

(function (app) {

    app.controller('m.interactive.controller', ['$scope', '$routeParams', function ($scope, $routeParams) {

        var $this = this;

        $this.action = $routeParams.action || 'inbox';

        $this.id = $routeParams.id;

        if ($this.id) {

        } else {
            $this.listData = $this.action == 'inbox' ? [
                { id: 1, name: '王小明', time: '20：50', reply: '不错！', content: '看看我拍的照片吧！' },
                { id: 2, name: '王小明', time: '昨天 20：55', reply: '不错！', content: '美国亚利桑那州商业气球航天公司“世界观公司”日前成功测试一种太空气球，游客只需花7.5万美元（约合人民币47万元）就可乘坐它进入太空边缘游览一圈。' },
                { id: 3, name: '王小明', time: '前天 21：00', reply: '不错！', content: '6月25日，被微信“封杀”24天的微软智能聊天机器人“小冰”今天在微博上“复活”，被圈出后会“秒回”，引起大量网友争相“调戏”。一开始小冰还能保持正常对话，但没过几分钟就已经被脑洞大开的网友搞得出现精神分裂症状，爆笑语录频现。' }
            ] : [
                { id: 4, name: '王小明', time: '昨天 20：55', reply: '不错！', content: '6月25日，被微信“封杀”24天的微软智能聊天机器人“小冰”今天在微博上“复活”，被圈出后会“秒回”，引起大量网友争相“调戏”。一开始小冰还能保持正常对话，但没过几分钟就已经被脑洞大开的网友搞得出现精神分裂症状，爆笑语录频现。' },
                { id: 5, name: '王小明', time: '20：50', reply: '不错！', content: '看看我拍的照片吧！' },
                { id: 6, name: '王小明', time: '昨天 20：55', reply: '不错！', content: '美国亚利桑那州商业气球航天公司“世界观公司”日前成功测试一种太空气球，游客只需花7.5万美元（约合人民币47万元）就可乘坐它进入太空边缘游览一圈。' },
                { id: 7, name: '王小明', time: '前天 21：00', reply: '不错！', content: '6月25日，被微信“封杀”24天的微软智能聊天机器人“小冰”今天在微博上“复活”，被圈出后会“秒回”，引起大量网友争相“调戏”。一开始小冰还能保持正常对话，但没过几分钟就已经被脑洞大开的网友搞得出现精神分裂症状，爆笑语录频现。' }
            ];
        }

        $this.emoji = {
            show: false,
            emojiPanel: $('.emoji-panel'),
            emojiDir: '/assets/img/emojis/',
            init: function () {
                var $emoji = $this.emoji, emojiHtml = [], limit = function (obj) { $('#contentLength').html((obj.value.length > 150 ? '<b style="color:#FC0000;">' + obj.value.length + '</b>' : obj.value.length) + '/150') };
                angular.forEach(IGrow.Config.emojis, function (item, key) { item.cnname && emojiHtml.push('<li><a href="javascript:void(0)" title="' + item.cnname + '"><img src="' + $emoji.emojiDir + item.img + '" /></a></li>'); });
                $emoji.emojiPanel.append('<div><ul>' + emojiHtml.join('') + '</ul></div>');
                $emoji.emojiPanel.find('a').click(function () {
                    $emoji.emojiPanel.prev().insertContent('[' + this.title + ']');
                    limit($emoji.emojiPanel.prev()[0]);
                });
                $emoji.emojiPanel.prev().click(function () {
                    $emoji.show = false;
                    $emoji.emojiPanel.scrollTop(0);
                    !$scope.$$phase && $scope.$apply();
                }).change(function () { limit(this) }).keyup(function () { limit(this) });
                $emoji.reset();
                $(window).resize($emoji.reset);
            },
            reset: function () {
                var $emoji = $this.emoji,
                    items = $emoji.emojiPanel.find('a').removeAttr('style'),
                    width = document.body.clientWidth - 60,
                    line = (width - width % 37) / 37,
                    last = 0;
                if (items.length <= line) {
                    items.css({ borderBottomColor: '#FFF' }).last().css({ borderRightColor: '#FFF' });
                } else {
                    last = items.length % line ? (items.length - items.length % line) / line : items.length / line - 1;
                    angular.forEach(items, function (item, index) {
                        (index + 1) % line === 0 && $(item).css({ borderRightColor: '#FFF' });
                        if ((index + 1) > last * line) {
                            $(item).css({ borderBottomColor: '#FFF' });
                        }
                    });
                }
            }
        };

        $this.emoji.init();

        $('#comment').on('hide.bs.modal', function (e) {
            $('.emoji-panel').scrollTop(0);
        }).on('hidden.bs.modal', function (e) {
            $('.emoji-panel').prev().val('').empty();
            $('#contentLength').html('0/150');
            $this.emoji.show = false;
            !$scope.$$phase && $scope.$apply();
        });

    }]);

})(angular.module('m.interactive', []));