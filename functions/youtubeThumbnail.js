module.exports = {
    getYoutubeThumbnail: function (url, s) {
        if (url === null) {
            return '';
        }
        let size = (s === null) ? 'big' : s;
        let results = url.match('[\\?&]v=([^&#]*)');
        let video   = (results === null) ? url : results[1];
        if (size === 'small') {
            return 'http://img.youtube.com/vi/' + video + '/2.jpg';
        }
        return 'http://img.youtube.com/vi/' + video + '/0.jpg';
    }
}