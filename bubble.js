(function () {
    var width = 2000,
        height = 1000;

    var svg = d3.select("#chart")
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .append("g")
        .attr("transform", "translate(0,0)")

    // <defs>
    //   <pattern id="jon-snow" height="100%" width="100%" patternContentUnits="objectBoundingBox">
    //     <image height="1" width="1" preserveAspectRatio="none" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="snow.jpg"></image>
    //   </pattern>
    // </defs>


    var defs = svg.append("defs");
//BURASI gereksız
    defs.append("pattern")
        .attr("id", "jon-snow")
        .attr("height", "100%")
        .attr("width", "100%")
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr("height", 1)
        .attr("width", 1)
        .attr("preserveAspectRatio", "none")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("xlink:href", "jon.png");

    var radiusScale = d3.scaleSqrt().domain([1, 100]).range([10, 80])

    // the simulation is a collection of forces
    // about where we want our circles to go
    // and how we want our circles to interact
    // STEP ONE: get them to the middle
    // STEP TWO: don't have them collide!!!

    var forceXLayer = d3.forceX(function (d) {
        if (d.layer === "3") {
            return 300
        } else if (d.layer === "6") {
            return 800
        } else if (d.layer === "8") {
            return 1200
        } else if (d.layer === "9") {
            return 1500
        } else {
            return 1800
        }
    }).strength(0.08)


    var forceXCombine = d3.forceX(width / 2).strength(0.06)

    var forceCollide = d3.forceCollide(function (d) {
        return radiusScale(d.size) + 1;
    })
    var simulation = d3.forceSimulation()
        .force("x", forceXCombine)
        .force("y", d3.forceY(height / 2).strength(0.06))
        .force("collide", forceCollide)

    d3.queue()
        .defer(d3.csv, "clusters.csv")
        .await(ready)

    function ready(error, datapoints) {
//hıw we do patterns
        defs.selectAll(".artist-pattern")
            .data(datapoints)
            .enter().append("pattern")
            .attr("class", "artist-pattern")
            //id create
            .attr("id", function (d) {
                // jon-snow
                // Madonna
                // the-eagles
                return d.cluster_id
            })
            .attr("height", "100%")
            .attr("width", "100%")
            .attr("patternContentUnits", "objectBoundingBox")
            .append("image")
            .attr("height", 1)
            .attr("width", 1)
            .attr("preserveAspectRatio", "none")
            // set the stroke width


            .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
            .attr("xlink:href", function (d) {
                return d.img_path
            })
        ;

        //howwe did 15 circles
        var circles = svg.selectAll(".artist")
            .data(datapoints)
            .enter().append("circle")
            .attr("class", "artist")
            .attr("r", function (d) {
                return radiusScale(d.size);
            })

            .attr("fill", function (d) {
                // "url(#jon-snow)"
                // "url(#Madonna)"
                // "url(#nicki-minaj)"
                //name wisely
                return "url(#" + d.cluster_id + ")"
            })
            .style("stroke", function (d) {
                if (d.layer === "3") {
                    return "#00ccff"
                } else if (d.layer === "6") {
                    return "#cc0000"
                } else if (d.layer === "8") {
                    return "#ff99dd"
                } else if (d.layer === "9") {
                    return "#ff944d"
                } else {
                    return "#ffffb3"
                }
            })
            .style("stroke-width", 5)
            .on('click', function (d) {
                console.log("clicked " + d.cluster_id)
            })


        d3.select("#layer").on("click", function () {
            simulation.force("x", forceXLayer)
                .alphaTarget(0.25)
                .restart()
            console.log("layer clicked")
        })
        d3.select("#combine").on("click", function () {
            simulation.force("x", forceXCombine)
                .alphaTarget(0.25)
                .restart()
            console.log("combine clicked")
        })
        simulation.nodes(datapoints)
            .on('tick', ticked)


        var setEvents = circles
            // Append hero text
            .on('click', function (d) {
                d3.select("h1").html("Cluster id " + d.cluster_id);
                d3.select("h2").html("Channels \n" + d.channel_id);

                d3.select(this).attr("r", 200);
            })

            .on('mouseenter', function () {
                    // select element in current context
                    d3.select(this)
                        .transition()
                        .attr("x", function (d) {
                            return -50;
                        })
                        .attr("y", function (d) {
                            return -50;
                        })
                        .attr("r", function (d) {
                            return radiusScale(d.size) + 5;
                        })

                    d3.select(this).raise();

                }
            )
            // set back
            .on('mouseleave', function () {
                d3.select(this)
                    .transition()
                    .attr("x", function (d) {
                        return -25;
                    })
                    .attr("y", function (d) {
                        return -25;
                    })
                    .attr("r", function (d) {
                        return radiusScale(d.size);
                    });
            });


        function ticked() {
            circles
                .attr("cx", function (d) {
                    return d.x
                })
                .attr("cy", function (d) {
                    return d.y
                })
        }

    }

})();