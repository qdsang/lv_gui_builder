
def query_attr(obj, id, type_s):
    d={}
    for i in ATTR['obj']:
        d[i]=eval(id+'.'+ATTR['obj'][i]+'()')
    d2 = {'action':'query_attr', 'id': id, 'data': d}
    print('\x06'+ujson.dumps(d2)+'\x15')

def query_xy(obj,id):
    d={'x': obj.get_x(),'y': obj.get_y()}
    indev = lv.indev_get_act()
    vect = lv.point_t()
    indev.get_vect(vect)
    x = obj.get_x() + vect.x
    y = obj.get_y() + vect.y
    obj.set_pos(x, y)
    d2 = {'action':'query_xy', 'id': id, 'data': d}
    print('\x06'+ ujson.dumps(d2)+'\x15')

def walv_callback(event,obj,id):
    code = event.get_code()
    query_xy(obj, id)
    if(code == lv.EVENT.PRESSED):
       query_attr(obj,id,0)
