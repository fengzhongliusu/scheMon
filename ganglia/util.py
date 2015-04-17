from ganglia.models import Resource,Metric,Host
import os
from FuXi.SPARQL.BackwardChainingStore import TopDownSPARQLEntailingStore
from FuXi.Horn.HornRules import HornFromN3
from rdflib.Graph import Graph
from rdflib import Namespace


'''
read the configure file of ganglia and save to the table of django models,return hostname list
'''
def read_ganglia_conf():    
    base_path = "/var/lib/ganglia/rrds/my_cluster/"
    dirc_list = os.walk(base_path)
    for x in dirc_list:
        name_list= x
        break
    host_list = name_list[1]
    #get hostname list in the cluster
    for name in host_list:
        if "summary" in name.lower():
            host_list.remove(name)
    print host_list
    return host_list


'''
add host to database
'''
def add_items(host_list):
    if len(host_list) == 0:
        print "host list is empty!!"
        return     
    #delete hosts that in db but not in cluster dir
    db_host_list = Host.objects.all();
    for db_host in db_host_list:
        if db_host.host_name not in host_list:
            db_host.delete()

    for host in host_list:
        #host not in the database yet
        if len(Host.objects.filter(host_name=host)) == 0:
            h = Host(host_name=host,host_ip=host)
            h.save()
            add_res_mtc(h) #add res and metric 



'''
add resource and metrics for host
'''
def add_res_mtc(h):
    res_mtc={"Cpu":['cpu_system','cpu_user','cpu_idle','cpu_nice'],
            "Mem":['mem_free','mem_shared','mem_total','mem_cached'],
            "Disk":['disk_free','disk_total'],
            "Load":['load_one','load_five','load_fifteen'],
            "Network":['pkts_in','pkts_out']
            }
    for item in res_mtc:
        r = Resource(host=h,res_hostname=h.host_name,res_name=item,res_type="hardware")
        r.save()
        for mtc in res_mtc[item]:
            m = Metric(resource=r,metric_name=mtc,mtr_hostname=r.res_hostname)
            m.save()


'''
use ontology to get the related resource and save to models 

def get_relate(res_list):
    if len(res_list) == 0:	#list is empty
        return 	
    if len(res_list[0].res_related) > 0:	#already reduced
        return 
    base_path = "/home/cshuo/Documents/monitor/ganglia/metric/"
    jar_path = base_path + "metric.jar"
    ttl_path = base_path + "metric.ttl"
    rules_path = base_path + "metric.rules"
    if jpype.isJVMStarted():
        print "jvm already running!!!"
    else:
        jpype.startJVM(jpype.getDefaultJVMPath(),"-ea","-Djava.class.path=%s" % jar_path)
        Reason = jpype.JClass("MetricRS")
    reason = Reason(ttl_path,rules_path)
    for res in res_list:
        relate = reason.getRelate(res.res_name);
        res.res_related = str(relate)	
        res.save()
    jpype.shutdownJVM()
'''

'''
function for reasoning the related res of the spefified resource
'''
def reason_func(resource_name):
    famNs = Namespace('file:///code/ganglia/metric.n3#')
    nsMapping = {'mtc' : famNs}
    rules = HornFromN3('ganglia/metric/metric_rule.n3')
    factGraph = Graph().parse('ganglia/metric/metric.n3',format='n3')
    factGraph.bind('mtc',famNs)
    dPreds = [famNs.relateTo]

    topDownStore=TopDownSPARQLEntailingStore(factGraph.store,factGraph,idb=rules,derivedPredicates = dPreds,nsBindings=nsMapping)
    targetGraph = Graph(topDownStore)
    targetGraph.bind('ex',famNs)
    #get list of the related resource 
    r_list = list(targetGraph.query('SELECT ?RELATETO { mtc:%s mtc:relateTo ?RELATETO}' % resource_name,initNs=nsMapping))
    
    res_list = []
    for res in r_list:
        res_list.append(str(res).split("#")[1]);
    return res_list

'''
for splitting the related resource list e.g.[cpu,mem]
'''
def str_to_list(s):
    if len(s) == 2:
        list_str = [];
    else:	   
        trip_str = s[1:-1]
        list_str = trip_str.split(",")
    return list_str


'''
generate images for metrics in the resource
'''
def res_img(metric_list):
    res_img_list = {}
    for metric in metric_list:
        hostname = str(metric.mtr_hostname)
        m_name = str(metric.metric_name)
        #generate_img(hostname,m_name,'hour')
        #generate_img(hostname,m_name,'day')
        #generate_img(hostname,m_name,'week')
        #generate_img(hostname,m_name,'month')
        metric_imgpath = ['ganglia/images/%s_hour.png' % m_name,
                'ganglia/images/%s_day.png' % m_name,
                'ganglia/images/%s_week.png'% m_name,
                'ganglia/images/%s_month.png' % m_name]	
        res_img_list[m_name] = metric_imgpath
    return res_img_list




def generate_img(host_name,metric_name,time):
    img_path = "/code/ganglia/static/ganglia/images/"
    rrd_path = "/var/lib/ganglia/rrds/my_cluster/"+host_name+"/"+metric_name.lower()+".rrd"
    if time == "hour":
        rrdtool_graph(img_path+metric_name+'_hour.png',rrd_path,'end-1h','now',metric_name,'180',time)
    elif time == "day":
        rrdtool_graph(img_path+metric_name+'_day.png',rrd_path,'end-1d','now',metric_name,'4320',time)
    elif time == "week":
        rrdtool_graph(img_path+metric_name+'_week.png',rrd_path,'end-1w','now',metric_name,'30240',time)
    elif time == "month":
        rrdtool_graph(img_path+metric_name+'_month.png',rrd_path,'end-1m','now',metric_name,'129600',time)
    else:
        return 

'''
call rrdtool to generate graph
'''
def rrdtool_graph(i_path,r_path,start,end,mtric_name,step,time):	
    vert_label = "default"
    if "cpu" in mtric_name:
        vert_label = "%"
    elif "mem" in mtric_name:
        vert_label = "KiB"
    elif "disk" in mtric_name:
        vert_label = "GB"
    command = "rrdtool graph %s --end %s --start %s --title %s --vertical-label %s --width 250 --height 150 DEF:ds=%s:sum:AVERAGE:step=%s AREA:ds#0000FF:%s" % (i_path,end,start,mtric_name+"/last_"+time,vert_label,r_path,step,mtric_name)
    os.system(command)


if __name__ == "__main__":
    print reason_func("Cpu")


