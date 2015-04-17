var plot_obj;


$(function(){   
    plot_obj = $.plot("#sche-chart", get_plot_data(), {
        xaxis: {
                    mode: "time",                  
                    timeformat: "%H:%M"
                },
        grid: {
                borderColor: "#f3f3f3",
                borderWidth: 1,
                hoverable: true,
                clickable: true,
                tickColor: "#f3f3f3"
              },
        series: {
            stack: false,
            lines: {
                show: true,
                fill: true
            }            
        },
        legend: {
            noColumns: 4,
            position: 'nw'
        }
    });
});

$(function(){
  setInterval(update_plot,3000);
});

function get_plot_data(){
  var dataset = [];
  var base_url = "http://114.212.189.134:8005/ganglia/xml/";
   url1 = base_url + "host1/bandwidth/60/";
   url2 = base_url + "host2/bandwidth/60/";
   url3 = base_url + "host3/bandwidth/60/";
   url4 = base_url + "host4/bandwidth/60/";

   var plot1 = {data:get_mtc_msg(url1),label:"host1",color:"#3c8d00"};
   var plot2 = {data:get_mtc_msg(url2),label:"host2",color:"#558d00"};
   var plot3 = {data:get_mtc_msg(url3),label:"host3",color:"#668d00"};
   var plot4 = {data:get_mtc_msg(url4),label:"host4",color:"#888d00"};

   dataset.push(plot1);
   dataset.push(plot2);
   dataset.push(plot3);
   dataset.push(plot4);   
   return dataset;
}

function update_plot(){
  var dataset = get_plot_data();
  plot_obj.setData(dataset);
  plot_obj.setupGrid();
  plot_obj.draw();
}

function get_mtc_msg(req_url){
    var v_array = [];
    var xml_http = new XMLHttpRequest();
      xml_http.open("GET",req_url,false);
      xml_http.send();
    xmlDoc = jQuery.parseXML(xml_http.responseText);
    $(xmlDoc).find('row').each(function(){
            var time = parseFloat($(this).children('t').text());
            var value = parseFloat($(this).children('v').text());
            v_array.push([time*1000,value]);      //time series xaxis require x to be millis
            });    
    return v_array;
  }