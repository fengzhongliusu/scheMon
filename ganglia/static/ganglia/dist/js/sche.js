var plot_obj;
var test_data = [
          {'host1':[{'type':'MATLAB','name':'vm1'},{'type':'MATLAB_MASTER','name':'vm2'}]},
          {'host2':[{'type':'MATLAB_MASTER','name':'vm1'},{'type':'GAME','name':'vm2'}]},
          {'host3':[{'type':'GAME','name':'vm1'},{'type':'MATLAB_MASTER','name':'vm2'}]},   
          {'host4':[{'type':'MATLAB','name':'vm1'},{'type':'HADOOP','name':'vm2'}]},   
          {'host1':[{'type':'HADOOP','name':'vm1'},{'type':'MATLAB_MASTER','name':'vm2'}]}
];

$(function(){
    var ws;
    var recv_data;
    ws = new WebSocket("ws://172.28.39.179:9008/soc");    
    //wait to recv data from ws socket
    // display_host({'host1':[{'type':'MATLAB','name':'vm1'},{'type':'MATLAB_MASTER','name':'vm2'}]});
    ws.onmessage = function(e) {        
        recv_data = JSON.parse(e.data);        
        if(recv_data.type == 'event' || recv_data.type == 'action'){
            add_list(recv_data);
        }        
        if(recv_data.type == 'hosts'){
            // alert(JSON.stringify(recv_data.value));
            display_host(recv_data.value);
        }
    };    
});

// setInterval(test_update,2000);

function test_update(){
    var index = Math.floor( Math.random() * 4);
    var data = test_data[index];
    alert(data);
    display_host(data);
}

$(function(){       
    plot_obj = $.plot("#sche-chart", get_plot_data(), {
        xaxis: {
                    mode: "time",                  
                    timeformat: "%H:%M:%S"
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


//display specified host
function display_host(data){
    for(var host in data) {
      $("#"+host).empty();
      if(data.hasOwnProperty(host)) {          
          // alert(host + " " + data[host][0]['type']+" "+data[host][0]['name']);           
          var vm_list = data[host];
          for(var i=0;i<vm_list.length;i++){
            put_vm(host,vm_list[i]['type'],vm_list[i]['name']);
          }          
      }
    }
}




function put_vm(host,vm_type,vm_name){  
  var vm_styl, vm_holder, squa_holder,squa_div,name_p;
  
  if(vm_type == 'MATLAB')
    vm_style = "red_square";
  if(vm_type == 'MATLAB_MASTER')
    vm_style = "green_square";
  if(vm_type == 'GAME')
    vm_style = "blue_square";
  if(vm_type == 'HADOOP')
    vm_style = "purple_square";

  // alert(host);
  vm_holder = document.getElementById(host);
  squa_holder = document.createElement("div");  
  squa_div = document.createElement("div");
  name_p = document.createElement("p");

  name_p.innerHTML = vm_name;
  squa_div.setAttribute('class',vm_style);
  squa_holder.setAttribute('class','col-lg-4');
  squa_holder.setAttribute('align','center');
  squa_holder.appendChild(squa_div);
  squa_holder.appendChild(name_p);  
  vm_holder.appendChild(squa_holder);
}

//add log list
function add_list(data){
    var log_item = document.getElementById("log_item");
    var div = document.createElement('div');    
    var span = document.createElement('span');
    div.setAttribute('class',"list-group-item");
    span.innerHTML = data.type + ": " + data.value;
    div.appendChild(span);

    log_item.appendChild(div);
}

//select file
function onFileSelected(event) {
  var selectedFile = event.target.files[0];
  var reader = new FileReader();

  var result = document.getElementById("text");

  reader.onload = function(event) {
    result.innerHTML = event.target.result;
  };

  reader.readAsText(selectedFile);
}


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