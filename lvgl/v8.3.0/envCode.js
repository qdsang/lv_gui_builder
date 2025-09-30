
//The Python code to Initialize the environment
export const EnvInitCode = (width, height) => [`
import ujson
import lvgl as lv
import SDL

try:
    lv_initialized
except NameError:
    var_exists = False
else:
    var_exists = True

if not var_exists:
    # 全局变量用于跟踪初始化状态
    # print("var_exists", var_exists)
    lv_initialized = False
    sdl_initialized = False
    disp_drv = None
    indev_drv = None
    current_width = 0
    current_height = 0
    screen = None

def init_lvgl(width, height):
    # print("init_lvgl")
    global lv_initialized, disp_drv, indev_drv, sdl_initialized, current_width, current_height, screen
    
    # 初始化 LVGL（只执行一次）
    if not lv_initialized:
        lv.init()
        # print("init_sdl")
        lv_initialized = True
        # print("LVGL initialized")
    else:
        return
    
    # 初始化 SDL（如果尺寸变化或未初始化）
    if not sdl_initialized:
        if sdl_initialized:
            # 如果已经初始化过，先清理之前的资源
            SDL.deinit()
        
        SDL.init(w=width, h=height, fullscreen=False, auto_refresh=False)
        sdl_initialized = True
        print(f"SDL initialized with {width}x{height}")
    current_width = width
    current_height = height
    
    # 清理之前的显示驱动（如果存在）
    if disp_drv:
        try:
            disp_drv.delete()
        except:
            pass  # 某些版本可能没有delete方法
    
    # 创建新的显示缓冲区
    disp_buf1 = lv.disp_draw_buf_t()
    buf1_1 = bytes(width * height * 4)  # 假设32位色深（RGBA8888）
    disp_buf1.init(buf1_1, None, len(buf1_1) // 4)
    
    # 创建新的显示驱动
    disp_drv = lv.disp_drv_t()
    disp_drv.init()
    disp_drv.draw_buf = disp_buf1
    disp_drv.flush_cb = SDL.monitor_flush
    disp_drv.hor_res = width
    disp_drv.ver_res = height
    disp_drv.register()
    # print("Display driver updated")
    
    # 清理之前的输入驱动（如果存在）
    if indev_drv:
        try:
            indev_drv.delete()
        except:
            pass  # 某些版本可能没有delete方法
    
    # 创建新的输入驱动
    indev_drv = lv.indev_drv_t()
    indev_drv.init()
    indev_drv.type = lv.INDEV_TYPE.POINTER
    indev_drv.read_cb = SDL.mouse_read
    indev_drv.register()
    # print("Input driver updated")
    
    # 创建新屏幕
    screen = lv.obj()
    screen.set_scrollbar_mode(lv.SCROLLBAR_MODE.OFF)
    screen.clear_flag(lv.obj.FLAG.SCROLLABLE)
    lv.scr_load(screen)
    
    #print(f"LVGL setup complete for {width}x{height}")

init_lvgl(${width}, ${height})

#print('boot ok')
`,
];

/* Define special function for python*/

// old getobjattr() function:
// "def getobjattr(obj,id,type_s):",
// "    d={}",
// "    d['id']=id",
// "    for i in dir(obj):",
// "        if 'get_' in i:",
// "            try:",
// "                ret = eval(id + '.' + i + '()')",
// "                if isinstance(ret, (int,float,str,bool)):",
// "                    d[i] = ret",
// "            except:",
// "                pass",
// "    for i in ATTR:",
// "        d[i]=eval(id+'.'+ATTR[i]+'()')",
// "    print('\x06'+ujson.dumps(d)+'\x15')",

const Getter = {
  obj: {
    x: 'get_x',
    y: 'get_y',
    width: 'get_width',
    height: 'get_height',
  },

  label: {
    label: 'get_text',
  },
  img: {
    label: 'get_src',
  },
};

export const QueryCode = `

def query_xy(obj, id):
    d = {'x': obj.get_x(),'y': obj.get_y()}
    indev = lv.indev_get_act()
    vect = lv.point_t()
    indev.get_vect(vect)
    x = obj.get_x() + vect.x
    y = obj.get_y() + vect.y
    obj.set_pos(x, y)
    d2 = {'action':'query_xy', 'id': id, 'data': d}
    print('\x06'+ujson.dumps(d2)+'\x15')

def lv_callback(event, obj, id):
    code = event.get_code()
    query_xy(obj, id)
    if(code == lv.EVENT.PRESSED):
       query_attr(obj, id, 0)

def query_attr(obj, id, type_s):
    d = {}
    for i in ATTR['obj']:
        d[i] = eval(id+'.'+ATTR['obj'][i]+'()')
    d2 = {'action':'query_attr', 'id': id, 'data': d}
    print('\x06' + ujson.dumps(d2) + '\x15')

ATTR= ` + JSON.stringify(Getter) + '';

export default {
  EnvInitCode,
  QueryCode,
};
