## 投影函数：转换经纬度

var projection = d3.geo.mercator()
.center([107, 31]) //中心位置
.scale(850) //放大比例
.translate([width/2, height/2]); //设置平移

## 路径生成器：根据地图数据生成 SVG

var path = d3.geo.path()
.projection(projection); //projection() 是设定生成器的投影函数，把上面定义的投影传入即可，计算路径时，会自己加入投影的影响。

## 向服务器请求文件并绘制地图

d3.json("china.json", function(error, root) {

    if (error)
        return console.error(error);
    console.log(root.features);

    svg.selectAll("path")
        .data( root.features )
        .enter()
        .append("path")
        .attr("stroke","#000")
        .attr("stroke-width",1)
        .attr("fill", function(d,i){
            return color(i);
        })
        .attr("d", path )   //使用地理路径生成器
        .on("mouseover",function(d,i){
                    d3.select(this)
                       .attr("fill","yellow");
                })
                .on("mouseout",function(d,i){
                    d3.select(this)
                       .attr("fill",color(i));
                });

});
d3.json() 不能直接读取本地文件，因此你需要搭建一个服务器，例如 Apache
