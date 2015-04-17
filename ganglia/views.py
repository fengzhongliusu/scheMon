from django.shortcuts import render,get_object_or_404
from django.http import HttpResponse
from ganglia.models import Resource,Metric,Host
import json
from ganglia.util import str_to_list,res_img,read_ganglia_conf,add_items,reason_func
import os 
import commands 
from sys import stdin,stdout,stderr
import time 


# Create your views here.
def index(request):
    #add content to database
    hname_list = read_ganglia_conf()
    add_items(hname_list)
    #get content from table
    host_list = Host.objects.all()
    resource_list = Resource.objects.all()
#    get_relate(resource_list)
    context = {'resource_list': resource_list,'host_list':host_list}
    return render(request,'ganglia/index.html',context)

def host_info(request,host_id):
    host = get_object_or_404(Host,pk=host_id)
    res_list = Resource.objects.filter(host=host);
    context = {'host':host,'res_list':res_list}    
    return render(request,'ganglia/host.html',context)

def res_info(request,host_id,resource_id):    
    res = get_object_or_404(Resource,pk=resource_id)
    mtc_list = Metric.objects.filter(resource=res)
    context = {'res':res,'mtc_list':mtc_list}
    return render(request,'ganglia/res.html',context)

#res schedule page
def res_sche(request):
    return render(request,'ganglia/sche.html')

'''
considering there is one and only one specified cluster
this function generated the according xml of the rrd
'''
def get_text(request, host_name, rrd_name, time_slot):
    base_url = "/var/lib/ganglia/rrds/my_cluster/"
    rrd_path = base_url + host_name + "/" + rrd_name + ".rrd"

    end = "now"    
    if time_slot == "1": 
        start = "end-1h"
        step = "10"
    elif time_slot == "2":
        start = "end-1d"
        step = "240"
    elif time_slot == "3":
        start = "end-1w"
        step = "1200"
    elif time_slot == "4":
        start = "end-1m"
        step = "4000"
    # for index page get resource utilization 
    elif time_slot == "8":      
        start = "end-60"
        step = "15" 
    elif time_slot == "60":
        start = "end-60"
        step = "3"
    else:        
        start = "end-600"
        step = "10"
    command = "rrdtool xport --start %s --end %s DEF:ds=%s:sum:AVERAGE:step=%s XPORT:ds:legend" % (start,end,rrd_path,step)
    status,output = commands.getstatusoutput(command)
    return HttpResponse(output)


'''
get the last update time of the host metrics 
return UNIX timestamp and now time interval 
'''
def last_update(request,host_name):
    base_url = "/var/lib/ganglia/rrds/my_cluster/" + host_name + "/load_one.rrd";
    command = "rrdtool lastupdate %s" % base_url
    status,output = commands.getstatusoutput(command)
    '''
    output string format is: 
     sum

     timestamp:  value
    '''
    #get the time stamp
    start = output.rindex("\n") + 1
    end = output.index(":")
    update_time = int(output[start:end])

    now_ts = int(time.time())
    interval = now_ts - update_time
    return HttpResponse(interval)


#get avg of specified mtc of all hosts of last_update
#for overview 
def last_mtc_avg(request,rrd_name):
    base_url = "/var/lib/ganglia/rrds/my_cluster/__SummaryInfo__/" + rrd_name +".rrd"
    command = "rrdtool lastupdate %s" % base_url
    status,output = commands.getstatusoutput(command)
    
    #get value sum and host num 
    #output format is 
    # sum num
    #
    # 1428893532: 2.3 1
    start = output.index(":") + 2
    v_pair = output[start:]
    return HttpResponse(v_pair)



#all hosts's avg metric value during last hour
def hour_mtc_avg(request,rrd_name):
    base_url = "/var/lib/ganglia/rrds/my_cluster/__SummaryInfo__/" + rrd_name +".rrd"
    command = "rrdtool xport --start end-1h --end now --step 10 DEF:ds1=%s:sum:AVERAGE DEF:ds2=%s:num:AVERAGE XPORT:ds1:sum XPORT:ds2:num" % (base_url,base_url)
    status, output = commands.getstatusoutput(command)
    return HttpResponse(output)
