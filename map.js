var width = window.innerWidth,
    height = window.innerHeight,
    diameter = Math.max(width, height),
	rect_width = 220,
	rect_height = 15;

var svg = d3.select("body").append("svg")
  			.attr("width", diameter)
   			.attr("height", diameter)
			.append("g")
   			.attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

d3.json('data.json', function(error, data) {
	if (error) throw error;

	data.relationships = []

	for (var i = 0; i < data.author.length; i++) {
		for (var j = 0; j < data.author[i].neighbours.length; j++) {
			var k = getObjectInArray('name', data.author[i].neighbours[j], data.keyword),
				rel_id = data.author[i].name + "-" + data.author[i].neighbours[j],
				rel = getObjectInArray('id', rel_id, data.relationships);
			if (rel) {
				rel.score += 1;
			} else {
				data.relationships.push( {  'id': rel_id, 
											'author': data.author[i], 
											'keyword' : k, 
											'score' : 1 });
			}
		}
	}

	function getObjectInArray(key, value, arr) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i][key] == value) {
				return arr[i];
			} 
    	}
    	return null;
	}

  	var al = data.author.length
  		al_range = al * rect_height / 2,
  		kl = data.keyword.length,
  		mid =  ( kl / 2.0 ),
  		author_y = d3.scale.linear()
    					.domain([0, al])
    					.range([- al_range, al_range])
		keyword_x = d3.scale.linear()
    				.domain([0, mid, mid, kl])
    				.range([15, 170, 190 ,355]),
		keyword_y = d3.scale.linear()
    				.domain([0, kl])
    				.range([0, diameter / 2 - 120]);

	data.keyword = data.keyword.map(function(d, i) { 
	    d.x = keyword_x(i);
	    d.y = diameter/3;
	    return d;
	});

	data.author = data.author.map(function(d, i) { 
	    d.x = -(rect_width / 2);
	    d.y = author_y(i);
	    return d;
	});

	var link_projection = d3.svg.diagonal()
    	.target(function(d) { return {"x": d.keyword.y * Math.cos(radialProjection(d.keyword.x)), 
                                  "y": -d.keyword.y * Math.sin(radialProjection(d.keyword.x))}; })            
    	.source(function(d) { return {"x": d.author.y + rect_height/2,
                                  "y": d.keyword.x > 180 ? d.author.x : d.author.x + rect_width}; })
    	.projection(function(d) { return [d.y, d.x]; });

// links
	var link = svg.append('g').attr('class', 'links').selectAll(".link")
    		.data(data.relationships)
  			.enter().append('path')
    		.attr('class', 'link')
    		.attr("d", link_projection)
    		.attr('stroke', 'grey')
    		.attr('stroke-width', function(d) { return Math.min( d.score / 3, 2 )});

	var knode = svg.append('g').selectAll(".outer_node")
	    .data(data.keyword)
	  	.enter().append("g")
	    .attr("class", "outer_node")
	    .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

	knode.append("circle")
	    .attr("r", 4.5);
	  
	knode.append("circle")
	    .attr('r', 20)
	    .attr('visibility', 'hidden');
	  
	knode.append("text")
		.attr('id', function(d) { return d.id + '-txt'; })
	    .attr("dy", ".31em")
	    .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
	    .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
	    .text(function(d) { return d.name; });
  

	var anode = svg.append('g').selectAll(".inner_node")
	    .data(data.author)
	  	.enter().append("g")
	    .attr("class", "inner_node")
	    .attr("transform", function(d, i) { return "translate(" + d.x + "," + d.y + ")"});
	  
	anode.append('rect')
	    .attr('width', rect_width)
	    .attr('height', rect_height)
	    .attr('fill', 'red');
	  
	anode.append("text")
		.attr('id', function(d) { return d.name + '-txt'; })
	    .attr('text-anchor', 'middle')
	    .attr("transform", "translate(" + rect_width / 2 + ", " + rect_height * .75 + ")")
	    .attr('font-size', '1em')
	    .text(function(d) { return d.name; });

	function radialProjection(x) {
    	return ((x - 90) / 180 * Math.PI) - (Math.PI/2);
	};

	function setColor(score) {

	};

});