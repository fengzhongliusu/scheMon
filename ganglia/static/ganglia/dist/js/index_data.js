var donut;   // for draw host status graph
var down_num = 0, up_num = 0;    //for update donut graph
var metric_plot;   //global plot obj for plotting 
var onshow_res="cpu";    //res showwing now 


//function for initting page modules
$(function(){    
	init_hstatus();  //init module hosts status
    update_util();   //init module res util     
    plot_avg("#area-chart","cpu",true);   //init to show cpu info 
});

//definite time task 
$(function(){    
	//update the Host up/down status every 120 seconds 
	setInterval(update_host_status,120000);

	//update the overview cluster every 100s
	setInterval(update_util,15000);

	//update cluster overview
	setInterval(update_cluster_res,15000);
});


//function for init host status 
function init_hstatus(){
	var num_pair = get_host_num();
	up_num = num_pair[0];            
	down_num = num_pair[1];              
	donut = Morris.Donut({
		element: 'graph-holder',
		data: [{
			label: "Hosts Up",
			value: up_num
		}, {
			label: "Hosts Down",
			value: down_num
		}],
		resize: true
	});
}

//function for plotting cluster overview
function plot_avg(elem_id,res_name,stack_opt){
   // init to show cluster cpu util 
    metric_plot = $.plot(elem_id, data_for_plot(res_name), {
        xaxis: {
                    mode: "time",                    
                    timeformat: "%H:%M:%S"
                },
        grid: {
                borderColor: "#f3f3f3",
                tickColor: "#f3f3f3",
                borderWidth: 1,
                hoverable: true,          
                clickable: true           
              },
        series: {
            stack: stack_opt,
            lines: {
                show: true,
                fill: true
            },
            points: 
            {
                show: false
            }            
        },        
    	legend: {
    	    noColumns: 4,
    	    position: 'nw'
    	}
    });        

    var op = {
            hour: "2-digit", minute: "2-digit", second: "2-digit"
        };    

    $("<div id='tooltip'></div>").css({
            position: "absolute",
            display: "none",
            border: "1px solid #66ffee",
            padding: "2px",
            "background-color": "#ffeeff", 
            "border-radius":"3px",
            opacity: 0.9
        }).appendTo("body");

    $("#area-chart").bind("plothover", function (event, pos, item) {
            if (item) {                
                var x = item.datapoint[0]/1000,
                y = item.datapoint[1].toFixed(2);
                var t = new Date(1970,0,1);                              
                t.setSeconds(x);
                $("#tooltip").html(t.toLocaleDateString("en-US",op)+"<br/>"+item.series.label+": "+y).  
                css({top: item.pageY+5, left: item.pageX+5}).
                fadeIn(150);
            } else {
                $("#tooltip").hide();
            }
    });
}

//function for updating the cluster overview
function update_cluster_res() {
	var dateset = data_for_plot(onshow_res);	
	metric_plot.setData(dataset);
	metric_plot.setupGrid();
	metric_plot.draw();
}

/*function for getting usg data for specific host's metric*/
function get_hour_metric(mtc_name){    
    var v_array = [];
    var base_url = "http://114.212.189.134:8005/ganglia/hour_mtc_avg/" + mtc_name;
    var xml_doc;
    var xml_http = new XMLHttpRequest();    
    
    xml_http.open("GET",base_url,false);
    xml_http.send();
    xml_doc = jQuery.parseXML(xml_http.responseText); 

    $(xml_doc).find('row').each(function(){
            var time = parseFloat($(this).children(":eq(0)").text());
            var sum = parseFloat($(this).children(":eq(1)").text());
            var num = parseFloat($(this).children(":eq(2)").text())
            var avg = (sum/num).toFixed(2);
            v_array.push([time*1000,avg]);      //time series xaxis require x to be millis
            });            
    return v_array;
};


/*get all metric data of res from all hosts and preparing for plotting*/
function data_for_plot(res_name){
    var mtc_1,mtc_2,mtc_3,mtc_4;
    var d1,d2,d3,d4;
    var datasets;    
    if(res_name == "cpu"){        
        d1 = get_hour_metric("cpu_user");
        d2 = get_hour_metric("cpu_system");
        d3 = get_hour_metric("cpu_nice");
        d4 = get_hour_metric("cpu_idle");        
        datasets = [{data:d1,label:"cpu_user  ",color:"#3c8d00"},{data:d2,label:"cpu_system",color:"#3c8dcc"},
        {data:d3,label:"cpu_wait",color:"#eeeeff"},{data:d4,label:"cpu_idle",color:"#66ffee"}];               
    } 
    if(res_name == "mem"){        
        d1 = get_hour_metric("mem_free");
        d2 = get_hour_metric("mem_cached");
        d3 = get_hour_metric("mem_buffers");
        d4 = get_hour_metric("mem_total");
        datasets = [{data:d1,label:"mem_free",color:"#3c8d00"},{data:d2,label:"mem_cached",color:"#3c8dcc"},
        {data:d3,label:"mem_buffers",color:"#eeeeff"},{data:d4,label:"mem_total",color:"#66ffee"}];               
    }
    if(res_name == "load"){        
        d1 = get_hour_metric("load_one");
        d2 = get_hour_metric("load_five");
        d3 = get_hour_metric("load_fifteen");        
        datasets = [{data:d1,label:"load_one",color:"#3c8d00"},{data:d2,label:"load_five",color:"#3c8dcc"},
        {data:d3,label:"load_fifteen",color:"#66ffee"}];        
    }
    if(res_name == "network"){        
        d1 = get_hour_metric("bytes_in");
        d2 = get_hour_metric("bytes_out");
        datasets = [{data:d1,label:"bytes_in",color:"#3c8d00"},{data:d2,label:"bytes_out",color:"#3c8dcc"}];        
    }
    return datasets;
}

//for drawdown list click actions
function show_metric(res_name){
    var datasets = data_for_plot(res_name);
    onshow_res = res_name;
    metric_plot.setData(datasets);
    metric_plot.setupGrid();
    metric_plot.draw();
}

//function for updating the cluster resourses untilization 
function update_util(){
    var cpu_elem = document.getElementById("cpu_util");
    var mem_elem = document.getElementById("mem_util");
    var disk_elem = document.getElementById("disk_util");
    var load_elem = document.getElementById("load_one");

    cpu_elem.innerHTML = (100 - get_mtc_avg('cpu_idle')).toFixed(1) + '%';    
    mem_elem.innerHTML = (100 - 100 * get_mtc_avg('mem_free') / get_mtc_avg('mem_total')).toFixed(1) + '%';
    disk_elem.innerHTML = (100 - 100 * get_mtc_avg('disk_free') /get_mtc_avg('disk_total')).toFixed(1) + '%';
    load_elem.innerHTML = get_mtc_avg('load_one').toFixed(1);	    
}


/*
 * get metric avg use data
*/
function get_mtc_avg(mtc_name){
	var base_url = "http://114.212.189.134:8005/ganglia/last_mtc_avg/" + mtc_name;
	var sum, num;
	var v_arr;
	var xml_http = new XMLHttpRequest();
	xml_http.open("GET",base_url,false);
	xml_http.send();
	
	var str = xml_http.responseText;
	v_arr = str.split(" ");	
	sum = parseFloat(v_arr[0]);
	num = parseInt(v_arr[1]);			
	return sum/num;
}

/*get specified host's update interval*/
function get_update_host(req_url){            
	var update_time;
	var xml_http = new XMLHttpRequest();
	xml_http.open("GET",req_url,false);
	xml_http.send();
	update_time = parseInt(xml_http.responseText);            
	return update_time;
}

/*function for update Host status Donut*/
function update_host_status(){            
	var num_pair = get_host_num();
	up_num = num_pair[0];            
	down_num = num_pair[1];            
	donut.setData([{
		label: "Hosts Up",
		value: up_num
	}, {
		label: "Hosts Down",
		value: down_num
	}]);
} 		
