(function($){
	var __filters = [
		{
			"pos_detail_1":"接尾",
			"pos_detail_2":"地域"
		},
		{
			"pos_detail_1":"固有名詞",
			"pos_detail_2":"地域",
			"pos_detail_3":"一般"
		},{
			"pos_detail_1":"固有名詞",
			"pos_detail_2":"人名"
		},{
			"pos_detail_1":"固有名詞",
			"pos_detail_2":"組織"
		}
	];
	function _needs_filtered(token){
		return __filters.some(function(elm){
			var ret = true;
			for(var k in elm){
				if(elm[k] != token[k]){
					return false;
				}
			}
			return ret;
		});
	}
	
	var __tokenizer = null;
	var __ready_queue = null;
	function _get_tokenizer(){
		return new Promise(function(resolve, reject){
			if(__tokenizer){
				resolve(__tokenizer)
			}else{
				var __handler = function(err,tokenizer){
					if(err){
						reject(err);
					}else{
						resolve(tokenizer);
					}
				};
				if(__ready_queue){
					__ready_queue.push(__handler);
				}else{
					__ready_queue = [__handler];
					kuromoji.builder({ dicPath:"./js/kuromoji/dict/" }).build(function (err, tokenizer) {
					    __tokenizer = tokenizer;
						__ready_queue.forEach(function(handler){
					    	handler(err, tokenizer);
					    });
					    __ready_queue = null;
					});
				}
			}
		});
	}
var _sanitize = function(option){
	var opt = option || {};
	var txt = opt.text;
	var outchr = opt.outchr || "●";
	return new Promise(function(resolve, reject){
		_get_tokenizer().then(function(tokenizer){
			var tokens = tokenizer.tokenize(txt);
			var offs = nextoffs = 0;
			function _get_start_idx(token){
				return offs + token.word_position - 1;
			}
			var result = txt;
			tokens = tokens.map(function(token){
				if(_get_start_idx(token) != nextoffs){
					offs = nextoffs;
				}
				var startidx = _get_start_idx(token)
				nextoffs = startidx + token.surface_form.length;
				var needfilter = _needs_filtered(token);
				if(needfilter){
					result = result.slice(0, startidx) + token.surface_form.replace(/./g,outchr) + result.slice(nextoffs);
				}
				return $.extend({
					"_needs_filtered": needfilter,
					"_start_idx": startidx
					},token);
			});
			function _sanitize_text(itxt, rexp){
				var matches = itxt.match(rexp);
				if(matches){
					matches.forEach(function(mtch){
						itxt = itxt.replace(mtch, mtch.replace(/./g, outchr));
					})
				}
				return itxt;
			}
			result = _sanitize_text(result,/(\d|[０-９])+[-ー](\d|[０-９])+[-ー](\d|[０-９])+[-ー](\d|[０-９])+/g);
			result = _sanitize_text(result,/(\d|[０-９])+[-ー](\d|[０-９])+[-ー](\d|[０-９])+/g);
			result = _sanitize_text(result,/(\d|[０-９])+[-ー](\d|[０-９])+/g);
			result = _sanitize_text(result,/[\w_-]+@[\w\.-]+\.\w{2,}/g);
			if(opt.extfilters){
				opt.extfilters.forEach(function(fltr){
					result = _sanitize_text(result,fltr);
				});
			}
			resolve({"result":result});
		}).catch(reject);
	});
};
window["sanitize_text"] = _sanitize;
})(jQuery);