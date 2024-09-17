import { z } from "zod"

export const DimensionsSchema = z.object({
  arrow_length: z.number(),
  extension_offset: z.number(),
  keep_text_aligned: z.boolean(),
  suppress_zeroes: z.boolean(),
  text_position: z.number(),
  units_format: z.number(),
})

export const PadsSchema = z.object({
  drill: z.number(),
  height: z.number(),
  width: z.number(),
})

export const ZonesSchema = z.object({
  min_clearance: z.number(),
})

export const RulesSchema = z.object({
  max_error: z.number(),
  min_clearance: z.number(),
  min_connection: z.number(),
  min_copper_edge_clearance: z.number(),
  min_hole_clearance: z.number(),
  min_hole_to_hole: z.number(),
  min_microvia_diameter: z.number(),
  min_microvia_drill: z.number(),
  min_resolved_spokes: z.number(),
  min_silk_clearance: z.number(),
  min_text_height: z.number(),
  min_text_thickness: z.number(),
  min_through_hole_diameter: z.number(),
  min_track_width: z.number(),
  min_via_annular_width: z.number(),
  min_via_diameter: z.number(),
  solder_mask_to_copper_clearance: z.number(),
  use_height_for_length_calcs: z.boolean(),
})

export const TeardropOptionSchema = z.object({
  td_onpadsmd: z.boolean(),
  td_onroundshapesonly: z.boolean(),
  td_ontrackend: z.boolean(),
  td_onviapad: z.boolean(),
})

export const TeardropParameterSchema = z.object({
  td_allow_use_two_tracks: z.boolean(),
  td_curve_segcount: z.number(),
  td_height_ratio: z.number(),
  td_length_ratio: z.number(),
  td_maxheight: z.number(),
  td_maxlen: z.number(),
  td_on_pad_in_zone: z.boolean(),
  td_target_name: z.string(),
  td_width_to_size_filter_ratio: z.number(),
})

export const TuningPatternDefaultsSchema = z.object({
  corner_radius_percentage: z.number(),
  corner_style: z.number(),
  max_amplitude: z.number(),
  min_amplitude: z.number(),
  single_sided: z.boolean(),
  spacing: z.number(),
})

export const TuningPatternSettingsSchema = z.object({
  diff_pair_defaults: TuningPatternDefaultsSchema,
  diff_pair_skew_defaults: TuningPatternDefaultsSchema,
  single_track_defaults: TuningPatternDefaultsSchema,
})

export const Ipc2581Schema = z.object({
  dist: z.string(),
  distpn: z.string(),
  internal_id: z.string(),
  mfg: z.string(),
  mpn: z.string(),
})

export const CvPcbSchema = z.object({
  equivalence_files: z.array(z.any()),
})

export const ErcSchema = z.object({
  erc_exclusions: z.array(z.any()),
  meta: z.object({ version: z.number() }),
  pin_map: z.array(z.array(z.number())),
  rule_severities: z.record(z.string(), z.string()),
})

export const LibrariesSchema = z.object({
  pinned_footprint_libs: z.array(z.any()),
  pinned_symbol_libs: z.array(z.any()),
})

export const MetaSchema = z.object({
  filename: z.string(),
  version: z.number(),
})

export const NetClassSchema = z.object({
  bus_width: z.number(),
  clearance: z.number(),
  diff_pair_gap: z.number(),
  diff_pair_via_gap: z.number(),
  diff_pair_width: z.number(),
  line_style: z.number(),
  microvia_diameter: z.number(),
  microvia_drill: z.number(),
  name: z.string(),
  pcb_color: z.string(),
  schematic_color: z.string(),
  track_width: z.number(),
  via_diameter: z.number(),
  via_drill: z.number(),
  wire_width: z.number(),
})

export const NetSettingsSchema = z.object({
  classes: z.array(NetClassSchema),
  meta: z.object({ version: z.number() }),
  net_colors: z.any(),
  netclass_assignments: z.any(),
  netclass_patterns: z.array(z.any()),
})

export const LastPathsSchema = z.object({
  gencad: z.string(),
  idf: z.string(),
  netlist: z.string(),
  plot: z.string(),
  pos_files: z.string(),
  specctra_dsn: z.string(),
  step: z.string(),
  svg: z.string(),
  vrml: z.string(),
})

export const PcbNewSchema = z.object({
  last_paths: LastPathsSchema,
  page_layout_descr_file: z.string(),
})

export const BomFormatSettingsSchema = z.object({
  field_delimiter: z.string(),
  keep_line_breaks: z.boolean(),
  keep_tabs: z.boolean(),
  name: z.string(),
  ref_delimiter: z.string(),
  ref_range_delimiter: z.string(),
  string_delimiter: z.string(),
})

export const BomFieldSchema = z.object({
  group_by: z.boolean(),
  label: z.string(),
  name: z.string(),
  show: z.boolean(),
})

export const BomSettingsSchema = z.object({
  exclude_dnp: z.boolean(),
  fields_ordered: z.array(BomFieldSchema),
  filter_string: z.string(),
  group_symbols: z.boolean(),
  name: z.string(),
  sort_asc: z.boolean(),
  sort_field: z.string(),
})

export const DrawingSchema = z.object({
  dashed_lines_dash_length_ratio: z.number(),
  dashed_lines_gap_length_ratio: z.number(),
  default_line_thickness: z.number(),
  default_text_size: z.number(),
  field_names: z.array(z.any()),
  intersheets_ref_own_page: z.boolean(),
  intersheets_ref_prefix: z.string(),
  intersheets_ref_short: z.boolean(),
  intersheets_ref_show: z.boolean(),
  intersheets_ref_suffix: z.string(),
  junction_size_choice: z.number(),
  label_size_ratio: z.number(),
  operating_point_overlay_i_precision: z.number(),
  operating_point_overlay_i_range: z.string(),
  operating_point_overlay_v_precision: z.number(),
  operating_point_overlay_v_range: z.string(),
  overbar_offset_ratio: z.number(),
  pin_symbol_size: z.number(),
  text_offset_ratio: z.number(),
})

export const SchematicSchema = z.object({
  annotate_start_num: z.number(),
  bom_export_filename: z.string(),
  bom_fmt_presets: z.array(z.any()),
  bom_fmt_settings: BomFormatSettingsSchema,
  bom_presets: z.array(z.any()),
  bom_settings: BomSettingsSchema,
  connection_grid_size: z.number(),
  drawing: DrawingSchema,
  legacy_lib_dir: z.string(),
  legacy_lib_list: z.array(z.any()),
  meta: z.object({ version: z.number() }),
  net_format_name: z.string(),
  page_layout_descr_file: z.string(),
  plot_directory: z.string(),
  spice_current_sheet_as_root: z.boolean(),
  spice_external_command: z.string(),
  spice_model_current_sheet_as_root: z.boolean(),
  spice_save_all_currents: z.boolean(),
  spice_save_all_dissipations: z.boolean(),
  spice_save_all_voltages: z.boolean(),
  subpart_first_id: z.number(),
  subpart_id_separator: z.number(),
})

export const DefaultsSchema = z.object({
  apply_defaults_to_fp_fields: z.boolean(),
  apply_defaults_to_fp_shapes: z.boolean(),
  apply_defaults_to_fp_text: z.boolean(),
  board_outline_line_width: z.number(),
  copper_line_width: z.number(),
  copper_text_italic: z.boolean(),
  copper_text_size_h: z.number(),
  copper_text_size_v: z.number(),
  copper_text_thickness: z.number(),
  copper_text_upright: z.boolean(),
  courtyard_line_width: z.number(),
  dimension_precision: z.number(),
  dimension_units: z.number(),
  dimensions: DimensionsSchema,
  fab_line_width: z.number(),
  fab_text_italic: z.boolean(),
  fab_text_size_h: z.number(),
  fab_text_size_v: z.number(),
  fab_text_thickness: z.number(),
  fab_text_upright: z.boolean(),
  other_line_width: z.number(),
  other_text_italic: z.boolean(),
  other_text_size_h: z.number(),
  other_text_size_v: z.number(),
  other_text_thickness: z.number(),
  other_text_upright: z.boolean(),
  pads: PadsSchema,
  silk_line_width: z.number(),
  silk_text_italic: z.boolean(),
  silk_text_size_h: z.number(),
  silk_text_size_v: z.number(),
  silk_text_thickness: z.number(),
  silk_text_upright: z.boolean(),
  zones: ZonesSchema,
})

export const DesignSettingsSchema = z.object({
  defaults: DefaultsSchema,
  diff_pair_dimensions: z.array(z.any()),
  drc_exclusions: z.array(z.any()),
  meta: z.object({ version: z.number() }),
  rule_severities: z.record(z.string(), z.string()),
  rules: RulesSchema,
  teardrop_options: z.array(TeardropOptionSchema),
  teardrop_parameters: z.array(TeardropParameterSchema),
  track_widths: z.array(z.any()),
  tuning_pattern_settings: TuningPatternSettingsSchema,
  via_dimensions: z.array(z.any()),
  zones_allow_external_fillets: z.boolean(),
})

export const BoardSchema = z.object({
  "3dviewports": z.array(z.any()),
  design_settings: DesignSettingsSchema,
  ipc2581: Ipc2581Schema,
  layer_presets: z.array(z.any()),
  viewports: z.array(z.any()),
})

export const KicadProjectSchema = z.object({
  board: BoardSchema,
  boards: z.array(z.any()),
  cvpcb: CvPcbSchema,
  erc: ErcSchema,
  libraries: LibrariesSchema,
  meta: MetaSchema,
  net_settings: NetSettingsSchema,
  pcbnew: PcbNewSchema,
  schematic: SchematicSchema,
  sheets: z.array(z.tuple([z.string(), z.string()])),
  text_variables: z.any(),
})
