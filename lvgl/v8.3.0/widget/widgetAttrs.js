export const widgetAttrs = {
  obj: {},
  arc: {
    start_angle: {
      type: 'function',
      args: [{ type: 'int', name: 'start' }],
      return_type: 'NoneType',
      api: 'set_start_angle',
    },
    end_angle: {
      type: 'function',
      args: [{ type: 'int', name: 'start' }],
      return_type: 'NoneType',
      api: 'set_end_angle',
    },
    angles: {
      type: 'function',
      args: [
        { type: 'int', name: 'start' },
        { type: 'int', name: 'end' },
      ],
      return_type: 'NoneType',
      api: 'set_angles',
    },
    bg_start_angle: {
      type: 'function',
      args: [{ type: 'int', name: 'start' }],
      return_type: 'NoneType',
      api: 'set_bg_start_angle',
    },
    bg_end_angle: {
      type: 'function',
      args: [{ type: 'int', name: 'start' }],
      return_type: 'NoneType',
      api: 'set_bg_end_angle',
    },
    bg_angles: {
      type: 'function',
      args: [
        { type: 'int', name: 'start' },
        { type: 'int', name: 'end' },
      ],
      return_type: 'NoneType',
      api: 'set_bg_angles',
    },
    rotation: {
      type: 'function',
      args: [{ type: 'int', name: 'start' }],
      return_type: 'NoneType',
      api: 'set_rotation',
    },
    mode: {
      type: 'function',
      args: [{ type: 'int', name: 'type' }],
      return_type: 'NoneType',
      api: 'set_mode',
    },
    value: {
      type: 'function',
      args: [{ type: 'int', name: 'value' }],
      return_type: 'NoneType',
      api: 'set_value',
    },
    range: {
      type: 'function',
      args: [
        { type: 'int', name: 'min' },
        { type: 'int', name: 'max' },
      ],
      return_type: 'NoneType',
      api: 'set_range',
    },
    change_rate: {
      type: 'function',
      args: [{ type: 'int', name: 'start' }],
      return_type: 'NoneType',
      api: 'set_change_rate',
    },
  },
  btn: {},
  img: {
    src: {
      type: 'function',
      args: [{ type: 'void*', name: 'src' }],
      return_type: 'NoneType',
      api: 'set_src',
    },
    offx: {
      type: 'function',
      args: [{ type: 'int', name: 'x' }],
      return_type: 'NoneType',
      api: 'set_offset_x',
    },
    offy: {
      type: 'function',
      args: [{ type: 'int', name: 'x' }],
      return_type: 'NoneType',
      api: 'set_offset_y',
    },
    angle: {
      type: 'function',
      args: [{ type: 'int', name: 'value' }],
      return_type: 'NoneType',
      api: 'set_angle',
    },
    pivot: {
      type: 'function',
      args: [
        { type: 'int', name: 'x' },
        { type: 'int', name: 'y' },
      ],
      return_type: 'NoneType',
      api: 'set_pivot',
    },
    zoom: {
      type: 'function',
      args: [{ type: 'int', name: 'start' }],
      return_type: 'NoneType',
      api: 'set_zoom',
    },
    antialias: {
      type: 'function',
      args: [{ type: 'bool', name: 'antialias' }],
      return_type: 'NoneType',
      api: 'set_antialias',
    },
    size_mode: {
      type: 'function',
      args: [{ type: 'int', name: 'mode' }],
      return_type: 'NoneType',
      api: 'set_size_mode',
    },
  },
  label: {
    text: {
      type: 'function',
      args: [{ type: 'char*', name: 'text' }],
      return_type: 'NoneType',
      api: 'set_text',
    },
    text_static: {
      type: 'function',
      args: [{ type: 'char*', name: 'text' }],
      return_type: 'NoneType',
      api: 'set_text_static',
    },
    long_mode: {
      type: 'function',
      args: [{ type: 'int', name: 'long_mode' }],
      return_type: 'NoneType',
      api: 'set_long_mode',
    },
    recolor: {
      type: 'function',
      args: [{ type: 'bool', name: 'antialias' }],
      return_type: 'NoneType',
      api: 'set_recolor',
    },
    text_sel_start: {
      type: 'function',
      args: [{ type: 'int', name: 'index' }],
      return_type: 'NoneType',
      api: 'set_text_sel_start',
    },
    text_sel_end: {
      type: 'function',
      args: [{ type: 'int', name: 'index' }],
      return_type: 'NoneType',
      api: 'set_text_sel_end',
    },
  },
  line: {
    points: {
      type: 'function',
      args: [
        { type: 'mp_arr_to_lv_point_t_____', name: 'points' },
        { type: 'int', name: 'point_num' },
      ],
      return_type: 'NoneType',
      api: 'set_points',
    },
    y_invert: {
      type: 'function',
      args: [{ type: 'bool', name: 'antialias' }],
      return_type: 'NoneType',
      api: 'set_y_invert',
    },
  },
  table: {
    cell_value: {
      type: 'function',
      args: [
        { type: 'int', name: 'row' },
        { type: 'int', name: 'col' },
        { type: 'char*', name: 'txt' },
      ],
      return_type: 'NoneType',
      api: 'set_cell_value',
    },
    row_cnt: {
      type: 'function',
      args: [{ type: 'int', name: 'start' }],
      return_type: 'NoneType',
      api: 'set_row_cnt',
    },
    col_cnt: {
      type: 'function',
      args: [{ type: 'int', name: 'start' }],
      return_type: 'NoneType',
      api: 'set_col_cnt',
    },
    col_width: {
      type: 'function',
      args: [
        { type: 'int', name: 'col_id' },
        { type: 'int', name: 'w' },
      ],
      return_type: 'NoneType',
      api: 'set_col_width',
    },
  },
  checkbox: {
    text: {
      type: 'function',
      args: [{ type: 'char*', name: 'text' }],
      return_type: 'NoneType',
      api: 'set_text',
    },
    text_static: {
      type: 'function',
      args: [{ type: 'char*', name: 'text' }],
      return_type: 'NoneType',
      api: 'set_text_static',
    },
  },
  bar: {
    value: {
      type: 'function',
      args: [
        { type: 'int', name: 'value' },
        { type: 'int', name: 'anim' },
      ],
      return_type: 'NoneType',
      api: 'set_value',
    },
    start_value: {
      type: 'function',
      args: [
        { type: 'int', name: 'value' },
        { type: 'int', name: 'anim' },
      ],
      return_type: 'NoneType',
      api: 'set_start_value',
    },
    range: {
      type: 'function',
      args: [
        { type: 'int', name: 'min' },
        { type: 'int', name: 'max' },
      ],
      return_type: 'NoneType',
      api: 'set_range',
    },
    mode: {
      type: 'function',
      args: [{ type: 'int', name: 'mode' }],
      return_type: 'NoneType',
      api: 'set_mode',
    },
  },
  slider: {
    value: {
      type: 'function',
      args: [
        { type: 'int', name: 'value' },
        { type: 'int', name: 'anim' },
      ],
      return_type: 'NoneType',
      api: 'set_value',
    },
    left_value: {
      type: 'function',
      args: [
        { type: 'int', name: 'value' },
        { type: 'int', name: 'anim' },
      ],
      return_type: 'NoneType',
      api: 'set_left_value',
    },
    range: {
      type: 'function',
      args: [
        { type: 'int', name: 'min' },
        { type: 'int', name: 'max' },
      ],
      return_type: 'NoneType',
      api: 'set_range',
    },
    mode: {
      type: 'function',
      args: [{ type: 'int', name: 'mode' }],
      return_type: 'NoneType',
      api: 'set_mode',
    },
  },
  btnmatrix: {
    map: {
      type: 'function',
      args: [{ type: 'mp_arr_to_char_ptr____', name: 'map' }],
      return_type: 'NoneType',
      api: 'set_map',
    },
    ctrl_map: {
      type: 'function',
      args: [{ type: 'mp_arr_to_lv_btnmatrix_ctrl_t_____', name: 'ctrl_map' }],
      return_type: 'NoneType',
      api: 'set_ctrl_map',
    },
    selected_btn: {
      type: 'function',
      args: [{ type: 'int', name: 'start' }],
      return_type: 'NoneType',
      api: 'set_selected_btn',
    },
    btn_ctrl: {
      type: 'function',
      args: [
        { type: 'int', name: 'btn_id' },
        { type: 'int', name: 'ctrl' },
      ],
      return_type: 'NoneType',
      api: 'set_btn_ctrl',
    },
    btn_ctrl_all: {
      type: 'function',
      args: [{ type: 'int', name: 'ctrl' }],
      return_type: 'NoneType',
      api: 'set_btn_ctrl_all',
    },
    btn_width: {
      type: 'function',
      args: [
        { type: 'int', name: 'btn_id' },
        { type: 'int', name: 'width' },
      ],
      return_type: 'NoneType',
      api: 'set_btn_width',
    },
    one_checked: {
      type: 'function',
      args: [{ type: 'bool', name: 'antialias' }],
      return_type: 'NoneType',
      api: 'set_one_checked',
    },
  },
  dropdown: {
    text: {
      type: 'function',
      args: [{ type: 'char*', name: 'text' }],
      return_type: 'NoneType',
      api: 'set_text',
    },
    options: {
      type: 'function',
      args: [{ type: 'char*', name: 'text' }],
      return_type: 'NoneType',
      api: 'set_options',
    },
    options_static: {
      type: 'function',
      args: [{ type: 'char*', name: 'text' }],
      return_type: 'NoneType',
      api: 'set_options_static',
    },
    selected: {
      type: 'function',
      args: [{ type: 'int', name: 'start' }],
      return_type: 'NoneType',
      api: 'set_selected',
    },
    dir: {
      type: 'function',
      args: [{ type: 'int', name: 'dir' }],
      return_type: 'NoneType',
      api: 'set_dir',
    },
    symbol: {
      type: 'function',
      args: [{ type: 'void*', name: 'src' }],
      return_type: 'NoneType',
      api: 'set_symbol',
    },
    selected_highlight: {
      type: 'function',
      args: [{ type: 'bool', name: 'antialias' }],
      return_type: 'NoneType',
      api: 'set_selected_highlight',
    },
  },
  roller: {
    options: {
      type: 'function',
      args: [
        { type: 'char*', name: 'options' },
        { type: 'int', name: 'mode' },
      ],
      return_type: 'NoneType',
      api: 'set_options',
    },
    selected: {
      type: 'function',
      args: [
        { type: 'int', name: 'sel_opt' },
        { type: 'int', name: 'anim' },
      ],
      return_type: 'NoneType',
      api: 'set_selected',
    },
    visible_row_count: {
      type: 'function',
      args: [{ type: 'int', name: 'grow' }],
      return_type: 'NoneType',
      api: 'set_visible_row_count',
    },
  },
  textarea: {
    text: {
      type: 'function',
      args: [{ type: 'char*', name: 'text' }],
      return_type: 'NoneType',
      api: 'set_text',
    },
    placeholder_text: {
      type: 'function',
      args: [{ type: 'char*', name: 'text' }],
      return_type: 'NoneType',
      api: 'set_placeholder_text',
    },
    cursor_pos: {
      type: 'function',
      args: [{ type: 'int', name: 'pos' }],
      return_type: 'NoneType',
      api: 'set_cursor_pos',
    },
    cursor_click_pos: {
      type: 'function',
      args: [{ type: 'bool', name: 'antialias' }],
      return_type: 'NoneType',
      api: 'set_cursor_click_pos',
    },
    password_mode: {
      type: 'function',
      args: [{ type: 'bool', name: 'antialias' }],
      return_type: 'NoneType',
      api: 'set_password_mode',
    },
    password_bullet: {
      type: 'function',
      args: [{ type: 'char*', name: 'text' }],
      return_type: 'NoneType',
      api: 'set_password_bullet',
    },
    one_line: {
      type: 'function',
      args: [{ type: 'bool', name: 'antialias' }],
      return_type: 'NoneType',
      api: 'set_one_line',
    },
    accepted_chars: {
      type: 'function',
      args: [{ type: 'char*', name: 'text' }],
      return_type: 'NoneType',
      api: 'set_accepted_chars',
    },
    max_length: {
      type: 'function',
      args: [{ type: 'int', name: 'index' }],
      return_type: 'NoneType',
      api: 'set_max_length',
    },
    insert_replace: {
      type: 'function',
      args: [{ type: 'char*', name: 'text' }],
      return_type: 'NoneType',
      api: 'set_insert_replace',
    },
    text_selection: {
      type: 'function',
      args: [{ type: 'bool', name: 'antialias' }],
      return_type: 'NoneType',
      api: 'set_text_selection',
    },
    password_show_time: {
      type: 'function',
      args: [{ type: 'int', name: 'start' }],
      return_type: 'NoneType',
      api: 'set_password_show_time',
    },
  },
  canvas: {
    px: {
      type: 'function',
      args: [
        { type: 'int', name: 'x' },
        { type: 'int', name: 'y' },
        { type: 'color32_t', name: 'c' },
      ],
      return_type: 'NoneType',
      api: 'set_px',
    },
    buffer: {
      type: 'function',
      args: [
        { type: 'void*', name: 'buf' },
        { type: 'int', name: 'w' },
        { type: 'int', name: 'h' },
        { type: 'int', name: 'cf' },
      ],
      return_type: 'NoneType',
      api: 'set_buffer',
    },
    px_color: {
      type: 'function',
      args: [
        { type: 'int', name: 'x' },
        { type: 'int', name: 'y' },
        { type: 'color32_t', name: 'c' },
      ],
      return_type: 'NoneType',
      api: 'set_px_color',
    },
    px_opa: {
      type: 'function',
      args: [
        { type: 'int', name: 'x' },
        { type: 'int', name: 'y' },
        { type: 'int', name: 'opa' },
      ],
      return_type: 'NoneType',
      api: 'set_px_opa',
    },
    palette: {
      type: 'function',
      args: [
        { type: 'int', name: 'id' },
        { type: 'color32_t', name: 'c' },
      ],
      return_type: 'NoneType',
      api: 'set_palette',
    },
  },
  switch: {},
  gif: {
    src: {
      type: 'function',
      args: [{ type: 'void*', name: 'src' }],
      return_type: 'NoneType',
      api: 'set_src',
    },
  },
  qrcode: {},
  animimg: {
    src: {
      type: 'function',
      args: [
        { type: 'mp_arr_to_lv_img_dsc_t_ptr____', name: 'dsc' },
        { type: 'int', name: 'num' },
      ],
      return_type: 'NoneType',
      api: 'set_src',
    },
    duration: {
      type: 'function',
      args: [{ type: 'int', name: 'index' }],
      return_type: 'NoneType',
      api: 'set_duration',
    },
    repeat_count: {
      type: 'function',
      args: [{ type: 'int', name: 'start' }],
      return_type: 'NoneType',
      api: 'set_repeat_count',
    },
  },
  calendar: {
    today_date: {
      type: 'function',
      args: [
        { type: 'int', name: 'year' },
        { type: 'int', name: 'month' },
        { type: 'int', name: 'day' },
      ],
      return_type: 'NoneType',
      api: 'set_today_date',
    },
    showed_date: {
      type: 'function',
      args: [
        { type: 'int', name: 'pos' },
        { type: 'int', name: 'cnt' },
      ],
      return_type: 'NoneType',
      api: 'set_showed_date',
    },
    highlighted_dates: {
      type: 'function',
      args: [
        { type: 'mp_arr_to_lv_calendar_date_t_____', name: 'highlighted' },
        { type: 'int', name: 'date_num' },
      ],
      return_type: 'NoneType',
      api: 'set_highlighted_dates',
    },
    day_names: {
      type: 'function',
      args: [{ type: 'char**', name: 'day_names' }],
      return_type: 'NoneType',
      api: 'set_day_names',
    },
  },
  calendar_header_arrow: {},
  calendar_header_dropdown: {},
  chart: {
    type: {
      type: 'function',
      args: [{ type: 'int', name: 'type' }],
      return_type: 'NoneType',
      api: 'set_type',
    },
    point_count: {
      type: 'function',
      args: [{ type: 'int', name: 'start' }],
      return_type: 'NoneType',
      api: 'set_point_count',
    },
    range: {
      type: 'function',
      args: [
        { type: 'int', name: 'axis' },
        { type: 'int', name: 'min' },
        { type: 'int', name: 'max' },
      ],
      return_type: 'NoneType',
      api: 'set_range',
    },
    update_mode: {
      type: 'function',
      args: [{ type: 'int', name: 'update_mode' }],
      return_type: 'NoneType',
      api: 'set_update_mode',
    },
    div_line_count: {
      type: 'function',
      args: [
        { type: 'int', name: 'hdiv' },
        { type: 'int', name: 'vdiv' },
      ],
      return_type: 'NoneType',
      api: 'set_div_line_count',
    },
    zoom_x: {
      type: 'function',
      args: [{ type: 'int', name: 'start' }],
      return_type: 'NoneType',
      api: 'set_zoom_x',
    },
    zoom_y: {
      type: 'function',
      args: [{ type: 'int', name: 'start' }],
      return_type: 'NoneType',
      api: 'set_zoom_y',
    },
    axis_tick: {
      type: 'function',
      args: [
        { type: 'int', name: 'axis' },
        { type: 'int', name: 'major_len' },
        { type: 'int', name: 'minor_len' },
        { type: 'int', name: 'major_cnt' },
        { type: 'int', name: 'minor_cnt' },
        { type: 'bool', name: 'label_en' },
        { type: 'int', name: 'draw_size' },
      ],
      return_type: 'NoneType',
      api: 'set_axis_tick',
    },
    series_color: {
      type: 'function',
      args: [
        { type: 'chart_series_t', name: 'series' },
        { type: 'color32_t', name: 'color' },
      ],
      return_type: 'NoneType',
      api: 'set_series_color',
    },
    x_start_point: {
      type: 'function',
      args: [
        { type: 'chart_series_t', name: 'ser' },
        { type: 'int', name: 'id' },
      ],
      return_type: 'NoneType',
      api: 'set_x_start_point',
    },
    cursor_pos: {
      type: 'function',
      args: [
        { type: 'chart_cursor_t', name: 'cursor' },
        { type: 'point_t', name: 'pos' },
      ],
      return_type: 'NoneType',
      api: 'set_cursor_pos',
    },
    cursor_point: {
      type: 'function',
      args: [
        { type: 'chart_cursor_t', name: 'cursor' },
        { type: 'chart_series_t', name: 'ser' },
        { type: 'int', name: 'point_id' },
      ],
      return_type: 'NoneType',
      api: 'set_cursor_point',
    },
    all_value: {
      type: 'function',
      args: [
        { type: 'chart_series_t', name: 'ser' },
        { type: 'int', name: 'value' },
      ],
      return_type: 'NoneType',
      api: 'set_all_value',
    },
    next_value: {
      type: 'function',
      args: [
        { type: 'chart_series_t', name: 'ser' },
        { type: 'int', name: 'value' },
      ],
      return_type: 'NoneType',
      api: 'set_next_value',
    },
    next_value2: {
      type: 'function',
      args: [
        { type: 'chart_series_t', name: 'ser' },
        { type: 'int', name: 'x_value' },
        { type: 'int', name: 'y_value' },
      ],
      return_type: 'NoneType',
      api: 'set_next_value2',
    },
    value_by_id: {
      type: 'function',
      args: [
        { type: 'chart_series_t', name: 'ser' },
        { type: 'int', name: 'id' },
        { type: 'int', name: 'value' },
      ],
      return_type: 'NoneType',
      api: 'set_value_by_id',
    },
    value_by_id2: {
      type: 'function',
      args: [
        { type: 'chart_series_t', name: 'ser' },
        { type: 'int', name: 'id' },
        { type: 'int', name: 'x_value' },
        { type: 'int', name: 'y_value' },
      ],
      return_type: 'NoneType',
      api: 'set_value_by_id2',
    },
    ext_y_array: {
      type: 'function',
      args: [
        { type: 'chart_series_t', name: 'ser' },
        { type: 'mp_arr_to_lv_coord_t_____', name: 'array' },
      ],
      return_type: 'NoneType',
      api: 'set_ext_y_array',
    },
    ext_x_array: {
      type: 'function',
      args: [
        { type: 'chart_series_t', name: 'ser' },
        { type: 'mp_arr_to_lv_coord_t_____', name: 'array' },
      ],
      return_type: 'NoneType',
      api: 'set_ext_x_array',
    },
  },
  keyboard: {
    textarea: {
      type: 'function',
      args: [{ type: 'lv_obj_t*', name: 'ta' }],
      return_type: 'NoneType',
      api: 'set_textarea',
    },
    mode: {
      type: 'function',
      args: [{ type: 'int', name: 'mode' }],
      return_type: 'NoneType',
      api: 'set_mode',
    },
    popovers: {
      type: 'function',
      args: [{ type: 'bool', name: 'antialias' }],
      return_type: 'NoneType',
      api: 'set_popovers',
    },
    map: {
      type: 'function',
      args: [
        { type: 'int', name: 'mode' },
        { type: 'mp_arr_to_char_ptr____', name: 'map' },
        { type: 'mp_arr_to_lv_btnmatrix_ctrl_t_____', name: 'ctrl_map' },
      ],
      return_type: 'NoneType',
      api: 'set_map',
    },
  },
  list: {},
  menu: {
    page: {
      type: 'function',
      args: [{ type: 'lv_obj_t*', name: 'ta' }],
      return_type: 'NoneType',
      api: 'set_page',
    },
    sidebar_page: {
      type: 'function',
      args: [{ type: 'lv_obj_t*', name: 'ta' }],
      return_type: 'NoneType',
      api: 'set_sidebar_page',
    },
    mode_header: {
      type: 'function',
      args: [{ type: 'int', name: 'mode_header' }],
      return_type: 'NoneType',
      api: 'set_mode_header',
    },
    mode_root_back_btn: {
      type: 'function',
      args: [{ type: 'int', name: 'mode_root_back_btn' }],
      return_type: 'NoneType',
      api: 'set_mode_root_back_btn',
    },
    load_page_event: {
      type: 'function',
      args: [
        { type: 'lv_obj_t*', name: 'obj' },
        { type: 'lv_obj_t*', name: 'page' },
      ],
      return_type: 'NoneType',
      api: 'set_load_page_event',
    },
  },
  menu_page: {},
  menu_cont: {},
  menu_section: {},
  menu_separator: {},
  msgbox: {},
  meter: {
    scale_ticks: {
      type: 'function',
      args: [
        { type: 'meter_scale_t', name: 'scale' },
        { type: 'int', name: 'cnt' },
        { type: 'int', name: 'width' },
        { type: 'int', name: 'len' },
        { type: 'color32_t', name: 'color' },
      ],
      return_type: 'NoneType',
      api: 'set_scale_ticks',
    },
    scale_major_ticks: {
      type: 'function',
      args: [
        { type: 'meter_scale_t', name: 'scale' },
        { type: 'int', name: 'nth' },
        { type: 'int', name: 'width' },
        { type: 'int', name: 'len' },
        { type: 'color32_t', name: 'color' },
        { type: 'int', name: 'label_gap' },
      ],
      return_type: 'NoneType',
      api: 'set_scale_major_ticks',
    },
    scale_range: {
      type: 'function',
      args: [
        { type: 'meter_scale_t', name: 'scale' },
        { type: 'int', name: 'min' },
        { type: 'int', name: 'max' },
        { type: 'int', name: 'angle_range' },
        { type: 'int', name: 'rotation' },
      ],
      return_type: 'NoneType',
      api: 'set_scale_range',
    },
    indicator_value: {
      type: 'function',
      args: [
        { type: 'meter_indicator_t', name: 'indic' },
        { type: 'int', name: 'value' },
      ],
      return_type: 'NoneType',
      api: 'set_indicator_value',
    },
    indicator_start_value: {
      type: 'function',
      args: [
        { type: 'meter_indicator_t', name: 'indic' },
        { type: 'int', name: 'value' },
      ],
      return_type: 'NoneType',
      api: 'set_indicator_start_value',
    },
    indicator_end_value: {
      type: 'function',
      args: [
        { type: 'meter_indicator_t', name: 'indic' },
        { type: 'int', name: 'value' },
      ],
      return_type: 'NoneType',
      api: 'set_indicator_end_value',
    },
  },
  spinbox: {
    value: {
      type: 'function',
      args: [{ type: 'int', name: 'pos' }],
      return_type: 'NoneType',
      api: 'set_value',
    },
    rollover: {
      type: 'function',
      args: [{ type: 'bool', name: 'antialias' }],
      return_type: 'NoneType',
      api: 'set_rollover',
    },
    digit_format: {
      type: 'function',
      args: [
        { type: 'int', name: 'hdiv' },
        { type: 'int', name: 'vdiv' },
      ],
      return_type: 'NoneType',
      api: 'set_digit_format',
    },
    step: {
      type: 'function',
      args: [{ type: 'int', name: 'index' }],
      return_type: 'NoneType',
      api: 'set_step',
    },
    range: {
      type: 'function',
      args: [
        { type: 'int', name: 'min' },
        { type: 'int', name: 'max' },
      ],
      return_type: 'NoneType',
      api: 'set_range',
    },
    cursor_pos: {
      type: 'function',
      args: [{ type: 'int', name: 'grow' }],
      return_type: 'NoneType',
      api: 'set_cursor_pos',
    },
    digit_step_direction: {
      type: 'function',
      args: [{ type: 'int', name: 'dir' }],
      return_type: 'NoneType',
      api: 'set_digit_step_direction',
    },
  },
  spinner: {},
  tabview: {
    act: {
      type: 'function',
      args: [
        { type: 'int', name: 'id' },
        { type: 'int', name: 'anim_en' },
      ],
      return_type: 'NoneType',
      api: 'set_act',
    },
  },
  tileview: {},
  win: {},
  colorwheel: {
    hsv: {
      type: 'function',
      args: [{ type: 'color_hsv_t', name: 'hsv' }],
      return_type: 'bool',
      api: 'set_hsv',
    },
    rgb: {
      type: 'function',
      args: [{ type: 'color32_t', name: 'color' }],
      return_type: 'bool',
      api: 'set_rgb',
    },
    mode: {
      type: 'function',
      args: [{ type: 'int', name: 'mode' }],
      return_type: 'NoneType',
      api: 'set_mode',
    },
    mode_fixed: {
      type: 'function',
      args: [{ type: 'bool', name: 'antialias' }],
      return_type: 'NoneType',
      api: 'set_mode_fixed',
    },
  },
  led: {
    color: {
      type: 'function',
      args: [{ type: 'color32_t', name: 'color' }],
      return_type: 'NoneType',
      api: 'set_color',
    },
    brightness: {
      type: 'function',
      args: [{ type: 'int', name: 'grow' }],
      return_type: 'NoneType',
      api: 'set_brightness',
    },
  },
  imgbtn: {
    src: {
      type: 'function',
      args: [
        { type: 'int', name: 'state' },
        { type: 'void*', name: 'src_left' },
        { type: 'void*', name: 'src_mid' },
        { type: 'void*', name: 'src_right' },
      ],
      return_type: 'NoneType',
      api: 'set_src',
    },
    state: {
      type: 'function',
      args: [{ type: 'int', name: 'state' }],
      return_type: 'NoneType',
      api: 'set_state',
    },
  },
  spangroup: {
    overflow: {
      type: 'function',
      args: [{ type: 'int', name: 'overflow' }],
      return_type: 'NoneType',
      api: 'set_overflow',
    },
    indent: {
      type: 'function',
      args: [{ type: 'int', name: 'x' }],
      return_type: 'NoneType',
      api: 'set_indent',
    },
    mode: {
      type: 'function',
      args: [{ type: 'int', name: 'mode' }],
      return_type: 'NoneType',
      api: 'set_mode',
    },
    lines: {
      type: 'function',
      args: [{ type: 'int', name: 'pos' }],
      return_type: 'NoneType',
      api: 'set_lines',
    },
  },
  screen: {},
};


let a = {"www": {}};
let setterMap = {
  animimg: {group: ''},
  arc: {group: 'basics', part: ['INDICATOR', 'MAIN']},
  bar: {group: 'visualiser'},
  btn: {group: ''},
  btnmatrix: {group: ''},
  button: {group: 'basics'},
  calendar: {group: 'controller'},
  calendar_header_arrow: {group: ''},
  calendar_header_dropdown: {group: ''},
  canvas: {group: ''},
  chart: {group: 'visualiser'},
  checkbox: {group: 'controller'},
  colorwheel: {group: 'controller'},
  dropdown: {group: 'controller'},
  gif: {group: ''},
  image: {group: 'basics'},
  img: {group: ''},
  imgbtn: {group: ''},
  imgbutton: {group: 'controller'},
  keyboard: {group: 'controller'},
  label: {group: 'basics'},
  led: {group: ''},
  line: {group: ''},
  list: {group: ''},
  menu: {group: ''},
  menu_cont: {group: ''},
  menu_page: {group: ''},
  menu_section: {group: ''},
  menu_separator: {group: ''},
  meter: {group: ''},
  msgbox: {group: ''},
  obj: {group: ''},
  object: {group: 'basics'},
  panel: {group: 'basics'},
  qrcode: {group: ''},
  roller: {group: 'controller'},
  screen: {group: ''},
  slider: {group: 'controller'},
  spangroup: {group: ''},
  spinbox: {group: 'controller'},
  spinner: {group: 'visualiser'},
  switch: {group: 'controller'},
  table: {group: ''},
  tabpage: {group: 'basics'},
  tabview: {group: 'basics'},
  textarea: {group: 'basics'},
  tileview: {group: ''},
  win: {group: ''},
};

for (let key in widgetAttrs) {
  if (!setterMap[key]) setterMap[key] = {group: ''};
}

// console.log('setterMap', setterMap);
