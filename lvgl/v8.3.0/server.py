import time
import socket
import struct
import uctypes
import uarray
import gc
import micropython
import ujson
import sys

import lvgl as lv
lv.init()

#windows only socket error codes!
WSAEWOULDBLOCK = 10035
WSAENOTSOCK = 10038
WSAECONNABORTED = 10053
WSAECONNRESET = 10054

PKT_IN_TYPE_COMMAND = 0
PKT_IN_TYPE_SCRIPT = 1
PKT_IN_TYPE_MOUSE = 2
PKT_IN_TYPE_BBREQ = 3

PKT_OUT_TYPE_ERR = 0
PKT_OUT_TYPE_MSG = 1
PKT_OUT_TYPE_BB = 2

MAGIC = 1229865290
blockRenderer = True

gMouseX = 0
gMouseY = 0
gMouseState = 0
scr_width = 1024
scr_height = 1024
scr_width = int(sys.argv[1])
scr_height = int(sys.argv[2])
server_port = int(sys.argv[3])

SOCK_ERR = {
    WSAEWOULDBLOCK : "WSAEWOULDBLOCK",
    WSAENOTSOCK : "WSAENOTSOCK",
    WSAECONNABORTED : "WSAECONNABORTED",
    WSAECONNRESET: "WSAECONNRESET"
}

PIX = {
    "ptr": (0 | uctypes.PTR, uctypes.UINT32)
}

HDR = {
    "magic": 0 | uctypes.UINT32,
    "type" : 4 | uctypes.UINT32,
    "length": 8 | uctypes.UINT32
}

SOCKADDR = {
    "family": 0 | uctypes.UINT16,
    "port": 2 | uctypes.UINT16,
    "a": 4 | uctypes.UINT8,
    "b": 5 | uctypes.UINT8,
    "c": 6 | uctypes.UINT8,
    "d": 7 | uctypes.UINT8
}

def current_milli_time():
    return round(time.time() * 1000)

def inet_ntop(addr):
    sa = uctypes.struct(uctypes.addressof(addr), SOCKADDR, uctypes.BIG_ENDIAN)
    return str(sa.a) + "." + str(sa.b) + "." + str(sa.c) + "." + str(sa.d) + ":" + str(sa.port)

addr = socket.getaddrinfo('127.0.0.1', server_port)[0][-1]

cl = False

s = socket.socket()
s.bind(addr)
s.listen(1)

print('Listening on', inet_ntop(addr))

print("Free memory: " + str(gc.mem_free()))
#arr = uarray.array('I',(0 for i in range(0,scr_width*scr_height)))

def mycallback(disp, area, color):
    
    width = (area.x2 - area.x1)+1
    height = (area.y2 - area.y1)+1

    if not cl:
        print("Client not connected! return!")
        disp.flush_ready()
        return

    #print("area size: " + str(width)+ " x "+str(height))

    pix = uctypes.struct(uctypes.addressof(color), PIX)

    try:
	if blockRenderer==False:
            cl.setblocking(1)
    
            # send magic number first
            cl.send(struct.pack("I", MAGIC))

            # packet type: image
            cl.send(struct.pack("I", PKT_OUT_TYPE_MSG))
            cl.send(struct.pack("I", 5*4+width*height*4))
    
            # send rendered area (length of payload)

            cl.send(struct.pack("I", area.x1))
            cl.send(struct.pack("I", area.y1))
            cl.send(struct.pack("I", area.x2))
            cl.send(struct.pack("I", area.y2))

            cl.send(struct.pack("I", lv.scr_act().get_id()))

            sent = cl.send(buf1_1, 0, width*height*4)

            #print("sent:"+str(sent))
            cl.setblocking(0)
    except Exception as e:
        print("EXCEPTION AREASEND: "+str(e))
        disp.flush_ready()
        return

    disp.flush_ready()

# Register SDL display driver

disp_buf1 = lv.disp_draw_buf_t()
buf1_1 = bytearray(scr_width*scr_height*4)
disp_buf1.init(buf1_1, None, len(buf1_1)//4)
disp_drv = lv.disp_drv_t()
disp_drv.init()
disp_drv.draw_buf = disp_buf1
disp_drv.hor_res = scr_width
disp_drv.ver_res = scr_height
disp_drv.flush_cb = mycallback
dispp = disp_drv.register()
dispp.refr_timer.set_period(16) # 60 fps refresh rate

# Regsiter SDL mouse driver

def my_input_read(drv, data):
    data.point.x = int(gMouseX)
    data.point.y = int(gMouseY)
    #LV_INDEV_STATE_PR=1, LV_INDEV_STATE_REL=0
    data.state = int(gMouseState)

indev_drv = lv.indev_drv_t()
indev_drv.init()
indev_drv.type = lv.INDEV_TYPE.POINTER
indev_drv.read_cb = my_input_read
indev_drv.register()

#lv.scr_load(lv.obj())

#lv.theme_default_init(dfff, lv.palette_main(lv.PALETTE.LIGHT_BLUE), lv.palette_main(lv.PALETTE.RED), True, lv.font_default())
#theme = lv.theme_basic_init(lv.disp_get_default())
#dispp.set_theme(theme)

def tenmillionpass():
    for i in range(0, 10000000):
        pass

#tenmillionpass()

while True:
    cl, addr = s.accept()

    cl.setblocking(0)
    
    try:
        print('Client connected from', inet_ntop(addr))
        while True:
            time.sleep(0.002)
            header=None
            try:
                header = cl.recv(12)
                #print("Got the header!")
            except Exception as e:
                #print("EXCEPTION HEADER RECV: " + str(e))
                pass
                continue
                break

            if not header:
                print("Connection closed gracefully!")
                break

            try:
                hdr = uctypes.struct(uctypes.addressof(header), HDR)

                if hdr.magic != MAGIC:
                    print("BAD MAGIC NUMBER: " + str(hdr.magic) + " should be: " + str(MAGIC))
                    pass
                    continue
                
            except Exception as e:
                print("EXCEPTION HEADER CAST: " + str(e))
                pass
                continue

            payload = b''
            data = ""
            cc = None

            while len(payload) < hdr.length and hdr.length>0:
                try:
                    payload += cl.recv(hdr.length - len(payload))
                    pass
                except Exception as e:
                    #print("EXCEPTION PAYLOAD RECV: " + str(e))
                    pass
                    continue

            try:
                data = payload.strip().decode('utf-8')
            except Exception as e:
                print("STRIP/DECODE/SPLIT FAILED: " + str(e))

            if hdr.type == PKT_IN_TYPE_COMMAND:
                print("command: " + data)
                pass
                continue
            
            elif hdr.type == PKT_IN_TYPE_MOUSE:
                try:
                    mdata = data.split("\n")
                    mouseObj = ujson.loads(mdata[0])
                    gMouseX = mouseObj['x']
                    gMouseY = mouseObj['y']
                    gMouseState = mouseObj['event']
                except Exception as e:
                    print("EXCEPTION MOUSE RECV: " + str(e))
                continue
            elif hdr.type == PKT_IN_TYPE_BBREQ:
                try:
                    strBB = ""
                    cc = compile(data, "nofile", "exec")
                    eval(cc)

                    if len(strBB)>0:
                        #build package
                        cl.setblocking(1)
                        cl.send(struct.pack("I", MAGIC))
                
                        # packet type: image
                        cl.send(struct.pack("I", PKT_OUT_TYPE_BB))
                        cl.send(struct.pack("I", len(strBB)))
    
                        # send rendered area (length of payload)
                        cl.send(strBB)
                        cl.setblocking(0)
                        #print("EVAL: SUCCESS, send bounding boxes: "+strBB)  #  ALL OK
                except Exception as e:
                    #print(sys.exc_info())
                    print("EXCEPTION BB SEND " + str(e))
                continue
            
            try:
                cc = compile(data, "nofile", "exec")
                eval(cc)
            except Exception as e:
                #print(sys.exc_info())
                errorStr = str(e)
                print("EVAL FAILED: " + errorStr)
                # print("CODE: " + data)

                try:
                    # send magic number first
                    cl.send(struct.pack("I", MAGIC))

                    # packet type: error
                    cl.send(struct.pack("I", PKT_OUT_TYPE_ERR))
                
                    # payload lengh
                    cl.send(struct.pack("I", len(errorStr)))
                    
                    #payload
                    cl.send(errorStr)
                except Exception as e:
                    key = int(str(e))
                    if key in SOCK_ERR:
                        print("Error writing socket: " + SOCK_ERR[key])
                    else:
                        print("Unknown socket error: " + str(e))

        print("Connection closed by client")
        cl.close()
    except Exception as e:
        #print(sys.exc_info())
        print("EXCEPTION GLOBAL: " + str(e))
        pass
