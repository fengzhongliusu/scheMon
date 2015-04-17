var cpu_plot,disk_plot,mem_plot,net_plot;

$(function(){	
    cpu_plot = plot_func("#cpu-chart",'cpu','1',true);    
    mem_plot = plot_func("#mem-chart",'mem','1',false);
    disk_plot = plot_func("#disk-chart",'disk','1',false);
    net_plot = plot_func("#net-chart",'net','1',false);
});


/*
 * basic plot func 
 */
function plot_func(elem_id,res_name,time_slot,stack_opt){
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
    var obj_plot = $.plot(elem_id, get_plot_msg(res_name,time_slot), {
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
            stack: stack_opt,
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

/*
 * get metric msg using req_url
 */
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

  /*
 *get metrics msg of a res with a specified time interval 
 */
function get_plot_msg(res_name,time_slot){
    var base_url = "http://114.212.189.134:8005/ganglia/xml/" + hostname;
    var dataset = [];   //for datas of every metric
    var url_list = [];  //url for metrics 
    var mtc_name = [];    
    var plot_color = ["#3c8d00","#3c8dcc","#eeeeff","#66ffee"];

    if(res_name == 'cpu'){
        mtc_name = ['cpu_system','cpu_user','cpu_idle','cpu_nice'];        
        url_list.push(base_url+'/'+'cpu_system/'+time_slot+'/');
        url_list.push(base_url+'/'+'cpu_user/'+time_slot+'/');
        url_list.push(base_url+'/'+'cpu_idle/'+time_slot+'/');
        url_list.push(base_url+'/'+'cpu_nice/'+time_slot+'/');
    }
    if(res_name == 'mem'){        
        mtc_name = ['mem_total','mem_free','mem_shared','mem_buffers'];
        url_list.push(base_url+'/'+'mem_total/'+time_slot+'/');
        url_list.push(base_url+'/'+'mem_free/'+time_slot+'/');
        url_list.push(base_url+'/'+'mem_shared/'+time_slot+'/');
        url_list.push(base_url+'/'+'mem_buffers/'+time_slot+'/');
    }
    if(res_name == 'disk'){
        mtc_name = ['disk_free','disk_total'];
        url_list.push(base_url+'/'+'disk_free/'+time_slot+'/');
        url_list.push(base_url+'/'+'disk_total/'+time_slot+'/');
    }
    if(res_name == 'net'){
        mtc_name = ['bytes_in','bytes_out'];
        url_list.push(base_url+'/'+'bytes_in/'+time_slot+'/');
        url_list.push(base_url+'/'+'bytes_out/'+time_slot+'/');
    }

    for(var i=0; i<url_list.length; i++){
        var data_pair = get_mtc_msg(url_list[i]);        
        var plot_data = {data:data_pair,label:mtc_name[i],color:plot_color[i]};
        dataset.push(plot_data);    
    }

    return dataset;
}
