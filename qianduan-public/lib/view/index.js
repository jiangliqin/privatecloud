define([
	'text! qianduan-public/index.html'
	],function(homeTemplate){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			var self = this;
			this.homeTemplate = _.template(homeTemplate),
			$("#niao").html('shagua')
		},
		events:{
		}//,

		render:function(){
			/*app.leftNav.hide();
			this.$el.html(this.homeTemplate());
			this.getTotal();
			this.getToday();
			this.getDay30();*/
			this.$('#niao').html('bienao')
		}
	});
});