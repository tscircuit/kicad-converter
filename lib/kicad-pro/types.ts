export interface KicadProject {
  board: Board
  boards: any[]
  cvpcb: CvPcb
  erc: Erc
  libraries: Libraries
  meta: Meta
  net_settings: NetSettings
  pcbnew: PcbNew
  schematic: Schematic
  sheets: [string, string][]
  text_variables: any
}

export interface Board {
  "3dviewports": any[]
  design_settings: DesignSettings
  ipc2581: Ipc2581
  layer_presets: any[]
  viewports: any[]
}

export interface DesignSettings {
  defaults: Defaults
  diff_pair_dimensions: any[]
  drc_exclusions: any[]
  meta: { version: number }
  rule_severities: { [key: string]: string }
  rules: Rules
  teardrop_options: TeardropOption[]
  teardrop_parameters: TeardropParameter[]
  track_widths: any[]
  tuning_pattern_settings: TuningPatternSettings
  via_dimensions: any[]
  zones_allow_external_fillets: boolean
}

export interface Defaults {
  apply_defaults_to_fp_fields: boolean
  apply_defaults_to_fp_shapes: boolean
  apply_defaults_to_fp_text: boolean
  board_outline_line_width: number
  copper_line_width: number
  copper_text_italic: boolean
  copper_text_size_h: number
  copper_text_size_v: number
  copper_text_thickness: number
  copper_text_upright: boolean
  courtyard_line_width: number
  dimension_precision: number
  dimension_units: number
  dimensions: Dimensions
  fab_line_width: number
  fab_text_italic: boolean
  fab_text_size_h: number
  fab_text_size_v: number
  fab_text_thickness: number
  fab_text_upright: boolean
  other_line_width: number
  other_text_italic: boolean
  other_text_size_h: number
  other_text_size_v: number
  other_text_thickness: number
  other_text_upright: boolean
  pads: Pads
  silk_line_width: number
  silk_text_italic: boolean
  silk_text_size_h: number
  silk_text_size_v: number
  silk_text_thickness: number
  silk_text_upright: boolean
  zones: Zones
}

export interface Dimensions {
  arrow_length: number
  extension_offset: number
  keep_text_aligned: boolean
  suppress_zeroes: boolean
  text_position: number
  units_format: number
}

export interface Pads {
  drill: number
  height: number
  width: number
}

export interface Zones {
  min_clearance: number
}

export interface Rules {
  max_error: number
  min_clearance: number
  min_connection: number
  min_copper_edge_clearance: number
  min_hole_clearance: number
  min_hole_to_hole: number
  min_microvia_diameter: number
  min_microvia_drill: number
  min_resolved_spokes: number
  min_silk_clearance: number
  min_text_height: number
  min_text_thickness: number
  min_through_hole_diameter: number
  min_track_width: number
  min_via_annular_width: number
  min_via_diameter: number
  solder_mask_to_copper_clearance: number
  use_height_for_length_calcs: boolean
}

export interface TeardropOption {
  td_onpadsmd: boolean
  td_onroundshapesonly: boolean
  td_ontrackend: boolean
  td_onviapad: boolean
}

export interface TeardropParameter {
  td_allow_use_two_tracks: boolean
  td_curve_segcount: number
  td_height_ratio: number
  td_length_ratio: number
  td_maxheight: number
  td_maxlen: number
  td_on_pad_in_zone: boolean
  td_target_name: string
  td_width_to_size_filter_ratio: number
}

export interface TuningPatternSettings {
  diff_pair_defaults: TuningPatternDefaults
  diff_pair_skew_defaults: TuningPatternDefaults
  single_track_defaults: TuningPatternDefaults
}

export interface TuningPatternDefaults {
  corner_radius_percentage: number
  corner_style: number
  max_amplitude: number
  min_amplitude: number
  single_sided: boolean
  spacing: number
}

export interface Ipc2581 {
  dist: string
  distpn: string
  internal_id: string
  mfg: string
  mpn: string
}

export interface CvPcb {
  equivalence_files: any[]
}

export interface Erc {
  erc_exclusions: any[]
  meta: { version: number }
  pin_map: number[][]
  rule_severities: { [key: string]: string }
}

export interface Libraries {
  pinned_footprint_libs: any[]
  pinned_symbol_libs: any[]
}

export interface Meta {
  filename: string
  version: number
}

export interface NetSettings {
  classes: NetClass[]
  meta: { version: number }
  net_colors: any
  netclass_assignments: any
  netclass_patterns: any[]
}

export interface NetClass {
  bus_width: number
  clearance: number
  diff_pair_gap: number
  diff_pair_via_gap: number
  diff_pair_width: number
  line_style: number
  microvia_diameter: number
  microvia_drill: number
  name: string
  pcb_color: string
  schematic_color: string
  track_width: number
  via_diameter: number
  via_drill: number
  wire_width: number
}

export interface PcbNew {
  last_paths: LastPaths
  page_layout_descr_file: string
}

export interface LastPaths {
  gencad: string
  idf: string
  netlist: string
  plot: string
  pos_files: string
  specctra_dsn: string
  step: string
  svg: string
  vrml: string
}

export interface Schematic {
  annotate_start_num: number
  bom_export_filename: string
  bom_fmt_presets: any[]
  bom_fmt_settings: BomFormatSettings
  bom_presets: any[]
  bom_settings: BomSettings
  connection_grid_size: number
  drawing: Drawing
  legacy_lib_dir: string
  legacy_lib_list: any[]
  meta: { version: number }
  net_format_name: string
  page_layout_descr_file: string
  plot_directory: string
  spice_current_sheet_as_root: boolean
  spice_external_command: string
  spice_model_current_sheet_as_root: boolean
  spice_save_all_currents: boolean
  spice_save_all_dissipations: boolean
  spice_save_all_voltages: boolean
  subpart_first_id: number
  subpart_id_separator: number
}

export interface BomFormatSettings {
  field_delimiter: string
  keep_line_breaks: boolean
  keep_tabs: boolean
  name: string
  ref_delimiter: string
  ref_range_delimiter: string
  string_delimiter: string
}

export interface BomSettings {
  exclude_dnp: boolean
  fields_ordered: BomField[]
  filter_string: string
  group_symbols: boolean
  name: string
  sort_asc: boolean
  sort_field: string
}

export interface BomField {
  group_by: boolean
  label: string
  name: string
  show: boolean
}

export interface Drawing {
  dashed_lines_dash_length_ratio: number
  dashed_lines_gap_length_ratio: number
  default_line_thickness: number
  default_text_size: number
  field_names: any[]
  intersheets_ref_own_page: boolean
  intersheets_ref_prefix: string
  intersheets_ref_short: boolean
  intersheets_ref_show: boolean
  intersheets_ref_suffix: string
  junction_size_choice: number
  label_size_ratio: number
  operating_point_overlay_i_precision: number
  operating_point_overlay_i_range: string
  operating_point_overlay_v_precision: number
  operating_point_overlay_v_range: string
  overbar_offset_ratio: number
  pin_symbol_size: number
  text_offset_ratio: number
}
