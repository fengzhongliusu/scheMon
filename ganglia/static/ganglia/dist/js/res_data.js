var mtc_plot;

$(function(){
    mtc_plot = plot_mtc("#mtc-chart",mtc_name[0],'1');    
});


/*
 * basic plot func 
 */
function plot_mtc(elem_id,mtc_name,time_slot){
    var time_fmt,tooltip_op;
    if(time_slot == '1'){
        time_fmt = "%H:%M";
        tooltip_op = {
            hour: "2-digit", minute: "2-digit", second: "2-digit"
        };
    }
    if(time_slot == '2'){
        time_fmt = "%y/%m/%d %H:%M";        
        tooltip_op = {
            month: "short",day: "numeric", hour: "2-digit", minute: "2-digit"
        };
    }
    if(time_slot == '3'){
        time_fmt = "%y/%m/%d";        
        tooltip_op = {
            month: "short",day: "numeric"
        };
    }
    if(time_slot == '4'){
        time_fmt = "%y/%m/%d";        
        tooltip_op = {
            month: "short",day: "numeric"
        };
    }
    var obj_plot = $.plot(elem_id, get_plot_data(mtc_name,time_slot), {
        xaxis: {
                    mode: "time",                  
                    timeformat: time_fmt
                },
        grid: {
                borderColor: "#f3f3f3",
                borderWidth: 1,
                hoverable: true,
                clickable: true,
                tickColor: "#f3f3f3"
              },
        series: {            
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

    $("<div id='tooltip'></div>").css({
            position: "absolute",
            display: "none",
            border: "1px solid #66ffee",
            padding: "2px",
            "background-color": "#ffeeff", 
            "border-radius":"3px",
            opacity: 0.9
        }).appendTo("body");

    $(elem_id).bind("plothover", function (event, pos, item) {
            if (item) {                
                var x = item.datapoint[0]/1000,
                y = item.datapoint[1].toFixed(2);
                var t = new Date(1970,0,1);                              
                t.setSeconds(x);
                $("#tooltip").html(t.toLocaleDateString("en-US",tooltip_op)+"<br/>"+item.series.label+": "+y).  
                css({top: item.pageY+5, left: item.pageX+5}).
                fadeIn(150);
            } else {
                $("#tooltip").hide();
            }
    });
}


function get_plot_data(metric_name,time_slot){
  var url = "http://114.212.189.134:8005/ganglia/xml/" + hostname + '/' + metric_name + '/' + time_slot +'/';
  var data_pair = get_mtc_msg(url);
  var dataset = [{data:data_pair,label:metric_name,color:"#3c8dcc"}];  
  return dataset;
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
