<?php
/**
 * Plugin Name:       Accessibility Panel (a11y-widget)
 * Plugin URI:        https://github.com/a11y-widget/a11y-widget
 * Description:       Adds a self-hosted-style accessibility panel to every page: quick profiles, text size and spacing, contrast modes, reading aids, read-aloud and page structure. No tracking, no account. Settings → Accessibility Panel.
 * Version:           1.2.0
 * Requires at least: 5.7
 * Requires PHP:      7.2
 * Author:            Sky Wei
 * License:           MIT
 * Text Domain:       a11y-widget
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'A11YW_VERSION', '1.2.0' );
define( 'A11YW_WIDGET_VERSION', '1.1.2' ); // widget release this plugin was tested with (used by the Pinned channel)
define( 'A11YW_URL_AUTO', 'https://a11ywidget.vercel.app/v1/a11y-widget.js' ); // latest release, 5-minute browser cache
define( 'A11YW_URL_PINNED', 'https://cdn.jsdelivr.net/gh/a11y-widget/a11y-widget@' . A11YW_WIDGET_VERSION . '/a11y-widget.js' );

/**
 * Default settings.
 */
function a11yw_defaults() {
	return array(
		'enabled'   => 1,
		'color'     => '#1f3a93',
		'ink'       => '#262b33',
		'accent'    => '#f3c552',
		'position'  => 'right',
		'statement' => '',
		'main'      => '',
		'shortcut'  => 1,
		'channel'   => 'auto',
	);
}

function a11yw_get_settings() {
	$saved = get_option( 'a11yw_settings', array() );
	return wp_parse_args( is_array( $saved ) ? $saved : array(), a11yw_defaults() );
}

/**
 * Sanitize the settings form.
 */
function a11yw_sanitize( $input ) {
	$d   = a11yw_defaults();
	$out = array();

	$out['enabled']  = empty( $input['enabled'] ) ? 0 : 1;
	$out['shortcut'] = empty( $input['shortcut'] ) ? 0 : 1;

	foreach ( array( 'color', 'ink', 'accent' ) as $key ) {
		$hex         = isset( $input[ $key ] ) ? sanitize_hex_color( $input[ $key ] ) : '';
		$out[ $key ] = $hex ? $hex : $d[ $key ];
	}

	$out['position']  = ( isset( $input['position'] ) && 'left' === $input['position'] ) ? 'left' : 'right';
	$out['channel']   = ( isset( $input['channel'] ) && 'pinned' === $input['channel'] ) ? 'pinned' : 'auto';
	$out['statement'] = isset( $input['statement'] ) ? esc_url_raw( trim( $input['statement'] ) ) : '';
	$out['main']      = isset( $input['main'] ) ? sanitize_text_field( $input['main'] ) : '';

	return $out;
}

/**
 * Settings page.
 */
function a11yw_register_settings() {
	register_setting(
		'a11yw',
		'a11yw_settings',
		array(
			'type'              => 'array',
			'sanitize_callback' => 'a11yw_sanitize',
			'default'           => a11yw_defaults(),
		)
	);
}
add_action( 'admin_init', 'a11yw_register_settings' );

function a11yw_add_menu() {
	add_options_page(
		__( 'Accessibility Panel', 'a11y-widget' ),
		__( 'Accessibility Panel', 'a11y-widget' ),
		'manage_options',
		'a11y-widget',
		'a11yw_render_settings_page'
	);
}
add_action( 'admin_menu', 'a11yw_add_menu' );

function a11yw_settings_link( $links ) {
	$url = admin_url( 'options-general.php?page=a11y-widget' );
	array_unshift( $links, '<a href="' . esc_url( $url ) . '">' . esc_html__( 'Settings', 'a11y-widget' ) . '</a>' );
	return $links;
}
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'a11yw_settings_link' );

function a11yw_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$s = a11yw_get_settings();
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Accessibility Panel', 'a11y-widget' ); ?></h1>
		<p>
			<?php esc_html_e( 'Adds an accessibility panel to every page of the site. Visitors can enlarge text, change contrast, enable reading aids, have the page read aloud and more. Their choices are saved only in their own browser.', 'a11y-widget' ); ?>
			<a href="https://github.com/a11y-widget/a11y-widget" target="_blank" rel="noopener"><?php esc_html_e( 'Documentation', 'a11y-widget' ); ?></a>
		</p>
		<form method="post" action="options.php">
			<?php settings_fields( 'a11yw' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><?php esc_html_e( 'Enable', 'a11y-widget' ); ?></th>
					<td>
						<label><input type="checkbox" name="a11yw_settings[enabled]" value="1" <?php checked( $s['enabled'], 1 ); ?>>
						<?php esc_html_e( 'Show the panel on the public site', 'a11y-widget' ); ?></label>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="a11yw-color"><?php esc_html_e( 'Accent colour', 'a11y-widget' ); ?></label></th>
					<td>
						<input id="a11yw-color" type="text" class="a11yw-color" name="a11yw_settings[color]" value="<?php echo esc_attr( $s['color'] ); ?>" data-default-color="#1f3a93">
						<p class="description"><?php esc_html_e( 'Used for the button and selected controls. White text is drawn on it, so pick a colour dark enough to read (contrast 4.5:1 or better).', 'a11y-widget' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="a11yw-ink"><?php esc_html_e( 'Text colour', 'a11y-widget' ); ?></label></th>
					<td><input id="a11yw-ink" type="text" class="a11yw-color" name="a11yw_settings[ink]" value="<?php echo esc_attr( $s['ink'] ); ?>" data-default-color="#262b33"></td>
				</tr>
				<tr>
					<th scope="row"><label for="a11yw-accent"><?php esc_html_e( 'Indicator colour', 'a11y-widget' ); ?></label></th>
					<td>
						<input id="a11yw-accent" type="text" class="a11yw-color" name="a11yw_settings[accent]" value="<?php echo esc_attr( $s['accent'] ); ?>" data-default-color="#f3c552">
						<p class="description"><?php esc_html_e( 'The small dot that shows settings are active.', 'a11y-widget' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Position', 'a11y-widget' ); ?></th>
					<td>
						<label><input type="radio" name="a11yw_settings[position]" value="right" <?php checked( $s['position'], 'right' ); ?>> <?php esc_html_e( 'Bottom right', 'a11y-widget' ); ?></label>&nbsp;&nbsp;
						<label><input type="radio" name="a11yw_settings[position]" value="left" <?php checked( $s['position'], 'left' ); ?>> <?php esc_html_e( 'Bottom left', 'a11y-widget' ); ?></label>
						<p class="description"><?php esc_html_e( 'Choose the side that does not already have a chat bubble or back-to-top button.', 'a11y-widget' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="a11yw-statement"><?php esc_html_e( 'Accessibility statement URL', 'a11y-widget' ); ?></label></th>
					<td>
						<input id="a11yw-statement" type="url" class="regular-text" name="a11yw_settings[statement]" value="<?php echo esc_attr( $s['statement'] ); ?>" placeholder="<?php echo esc_attr( home_url( '/accessibility/' ) ); ?>">
						<p class="description"><?php esc_html_e( 'Optional. Linked from the panel footer. Create a page describing your accessibility commitment and how to report a barrier.', 'a11y-widget' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="a11yw-main"><?php esc_html_e( 'Main content selector', 'a11y-widget' ); ?></label></th>
					<td>
						<input id="a11yw-main" type="text" class="regular-text code" name="a11yw_settings[main]" value="<?php echo esc_attr( $s['main'] ); ?>" placeholder="#main, main, [role=main], #content, #primary">
						<p class="description"><?php esc_html_e( 'Optional CSS selector. Read-aloud and the page-structure list use it. Leave blank for automatic detection.', 'a11y-widget' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Update channel', 'a11y-widget' ); ?></th>
					<td>
						<label><input type="radio" name="a11yw_settings[channel]" value="auto" <?php checked( $s['channel'], 'auto' ); ?>> <?php esc_html_e( 'Automatic: always the latest release (recommended)', 'a11y-widget' ); ?></label><br>
						<label><input type="radio" name="a11yw_settings[channel]" value="pinned" <?php checked( $s['channel'], 'pinned' ); ?>> <?php printf( esc_html__( 'Pinned: widget %s, updated only when you update this plugin', 'a11y-widget' ), esc_html( A11YW_WIDGET_VERSION ) ); ?></label>
					</td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Keyboard shortcut', 'a11y-widget' ); ?></th>
					<td><label><input type="checkbox" name="a11yw_settings[shortcut]" value="1" <?php checked( $s['shortcut'], 1 ); ?>> <?php esc_html_e( 'Allow Alt + Shift + A to open the panel', 'a11y-widget' ); ?></label></td>
				</tr>
			</table>
			<?php submit_button(); ?>
		</form>
		<hr>
		<p class="description">
			<?php esc_html_e( 'The panel script is loaded from the jsDelivr CDN and stores preferences in the visitor\'s browser only. Mention this in your privacy policy. A panel like this complements, but does not replace, an accessible theme and content.', 'a11y-widget' ); ?>
		</p>
	</div>
	<?php
}

/**
 * Colour pickers on the settings page.
 */
function a11yw_admin_assets( $hook ) {
	if ( 'settings_page_a11y-widget' !== $hook ) {
		return;
	}
	wp_enqueue_style( 'wp-color-picker' );
	wp_enqueue_script( 'wp-color-picker' );
	wp_add_inline_script( 'wp-color-picker', 'jQuery(function($){$(".a11yw-color").wpColorPicker();});' );
}
add_action( 'admin_enqueue_scripts', 'a11yw_admin_assets' );

/**
 * Front-end: configuration object + script tag, just before </body>.
 */
function a11yw_print_widget() {
	if ( is_admin() || is_feed() || is_embed() || ( function_exists( 'is_customize_preview' ) && is_customize_preview() ) ) {
		return;
	}
	$s = a11yw_get_settings();
	if ( empty( $s['enabled'] ) ) {
		return;
	}

	$config = array(
		'color'    => $s['color'],
		'ink'      => $s['ink'],
		'accent'   => $s['accent'],
		'position' => $s['position'],
		'shortcut' => $s['shortcut'] ? 'on' : 'off',
	);
	if ( ! empty( $s['statement'] ) ) {
		$config['statement'] = $s['statement'];
	}
	if ( ! empty( $s['main'] ) ) {
		$config['main'] = $s['main'];
	}

	echo '<script>window.A11yWidgetConfig=' . wp_json_encode( $config ) . ';</script>' . "\n";

	// Site owners can self-host the file: add_filter( 'a11yw_script_url', fn() => '/wp-content/a11y-widget.js' );
	$url   = apply_filters( 'a11yw_script_url', 'pinned' === $s['channel'] ? A11YW_URL_PINNED : A11YW_URL_AUTO );
	$attrs = array(
		'src'   => $url,
		'defer' => true,
	);
	if ( function_exists( 'wp_print_script_tag' ) ) {
		wp_print_script_tag( $attrs );
	} else {
		echo '<script src="' . esc_url( $url ) . '" defer></script>' . "\n";
	}
}
add_action( 'wp_footer', 'a11yw_print_widget', 99 );
