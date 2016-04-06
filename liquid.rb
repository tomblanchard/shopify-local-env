# Dependencies
require 'liquid'
require 'json'
require 'digest/md5'
require 'uri'


# Args/params from CLI usage
$template = ARGV[0]
$data = JSON.parse( File.read("site/temp/#{ARGV[1]}.json") )


# Liquid includes
Liquid::Template.file_system = Liquid::LocalFileSystem.new('src/theme/snippets/', '%s.liquid')

module Liquid
  class LocalFileSystem
    def full_path(template_path)
      raise FileSystemError, "Illegal template name '#{template_path}'" unless template_path =~ /\A[^\/][a-zA-Z0-9_.\-\/]+\z/

      full_path = if template_path.include?('/'.freeze)
        File.join(root, File.dirname(template_path), @pattern % File.basename(template_path))
      else
        File.join(root, @pattern % template_path)
      end

      raise FileSystemError, "Illegal template path '#{File.expand_path(full_path)}'" unless File.expand_path(full_path) =~ /\A#{File.expand_path(root)}/

      full_path
    end
  end
end


# HTML filters
module HtmlFilters
  def stylesheet_tag(input)
    "<link href='#{input}' rel='stylesheet' type='text/css' media='all' />"
  end

  def script_tag(input)
    "<script src='#{input}' type='text/javascript'></script>"
  end

  def img_tag(input, alt = nil, classes = nil)
    "<img src='#{input}' alt='#{alt}' class='#{classes}' />"
  end
end
Liquid::Template.register_filter(HtmlFilters)


# Money filters
module MoneyFilters
  def money(cents, format = $data['shop']['money_format'])
    return '' if cents.nil?

    if cents.is_a? String
      cents = cents[/[^.]+/]
      cents = cents.to_i
    end

    value = ''
    placeholderRegex = /\{\{\s*(\w+)\s*\}\}/
    formatString = format

    def format_with_delimiters(number, precision = 2, thousands = ',', decimal = '.')
      return 0 if !number.is_a? Numeric || number.nil?

      number = (number/100.0)
      number = "%.#{precision}f" % number

      parts   = "#{number}".split(".")
      dollars = parts[0].gsub(/(\d)(?=(\d\d\d)+(?!\d))/, '\\1' + thousands)
      cents   = parts[1] ? (decimal + parts[1]) : ''

      return dollars + cents
    end

    case formatString.match(placeholderRegex)[1]
    when 'amount'
      value = format_with_delimiters(cents)
    when 'amount_no_decimals'
      value = format_with_delimiters(cents, 0)
    when 'amount_with_comma_separator'
      value = format_with_delimiters(cents, 2, '.', ',')
    when 'amount_no_decimals_with_comma_separator'
      value = format_with_delimiters(cents, 0, '.', ',')
    end

    formatString.gsub(placeholderRegex, value)
  end

  def money_with_currency(cents)
    money(cents, format = $data['shop']['money_with_currency_format'])
  end

  def money_without_trailing_zeros(cents, currency = nil)
    money(cents).sub!(".00", "")
  end

  def money_without_currency(cents)
    money(cents, "{{amount}}")
  end
end
Liquid::Template.register_filter(MoneyFilters)


# String filters
module StringFilters
  def pluralize(number, singular, plural = nil)
    number = number.to_i
    if number == 1
      "#{singular}"
    elsif plural.nil?
      "#{singular}s"
    else
      "#{plural}"
    end
  end

  def camelcase(input)
    input = input.gsub(/[^0-9A-Za-z]/, ' ')
    input = input.split.map(&:capitalize).join(' ')
    input = input.gsub(/\s+/, "")

    input
  end

  def handle(input)
    input = input.gsub(/[^0-9A-Za-z]/, '-').gsub('--', '-')
    input = input.downcase

    input
  end

  def handleize(input)
    handle(input)
  end

  def md5(input)
    Digest::MD5.hexdigest(input)
  end

  def url_escape(input)
    URI.escape(input)
  end

  def url_param_escape(input)
    url_escape(input).gsub('&', '%26')
  end
end
Liquid::Template.register_filter(StringFilters)


# URL filters
module UrlFilters
  def shopify_asset_url(input)
    scripts = {
      :'gift-card.css' => "//cdn.shopify.com/s/assets/themes_support/gift-card-3beec6c8bd8796542b856b476db7b451672def9717738b62af01bae1b91fb999.css",
      :'modernizr.gift-card.js' => "//cdn.shopify.com/s/assets/themes_support/modernizr.gift-card-4752c7825ca00ad578f2519c935eaec9b7935f5d75c3f3f03e8e8a4238f9b0c3.js",
      :'vendor/qrcode.js' => "//cdn.shopify.com/s/assets/themes_support/vendor/qrcode-38dd6050897a069ec84f8bddc58687ebb811a98fc7bc590403aa51d8864005ed.js",
      :'vendor/html5shiv.js' => "//cdn.shopify.com/s/assets/themes_support/vendor/html5shiv-38ba6f0f7fa20f650eadee708c9f77d1a0781c79a2453a22da2db72506484015.js",
      :'gift-card/card.jpg' => "//cdn.shopify.com/s/assets/themes_support/gift-card/card-ab9d5ddd65960cb0517b60490896c3431b8ca69e1085651ec5f50afa9f852c56.jpg",
      :'gift-card/icon-bug.png' => "//cdn.shopify.com/s/assets/themes_support/gift-card/icon-bug-e645ea11d9edae4cf5230c1eea955694fd12b27fcf6d2bf11cb0184558525b96.png",
      :'shopify_common.js' => "//cdn.shopify.com/s/assets/themes_support/shopify_common-c14dd13bd5df45b21d8926574bf1aea3f0f1202f080e6ddb3eb954bdb8fa195e.js",
      :'customer_area.js' => "//cdn.shopify.com/s/assets/themes_support/customer_area-8e117b99b6e8454435d157c197e9375e762aba8a5888846d0f7a76b930bf1ece.js",
      :'option_selection.js' => "//cdn.shopify.com/s/assets/themes_support/option_selection-6e8dd69c6db6118b1aa534eec7452e7dd224ae1d8ac4f0d466af6e3ef9d2ef2c.js",
      :'api.jquery.js' => "//cdn.shopify.com/s/assets/themes_support/api.jquery-3fdf7f8ecde4022383bde5e52e9d15002ce0866a679c7fa8a02be79b7a21c3ec.js",
      :'customer.css' => "//cdn.shopify.com/s/assets/themes_support/customer-be6a3d94e17643f1864112560e8d4c9d06e170e4a2c4c3d640eedcc2a66b5c10.css"
    }

    script = ''

    scripts.each do |key, value|
      if "#{key}" == input
        script = value
      end
    end

    script
  end

  def asset_url(input)
    path = input

    if input.include? ".scss"
      "assets/#{input}".sub! '.scss.css', '.css'
    elsif input.include? ".css"
      "assets/#{input}"
    elsif input.include? ".js"
      "assets/#{input}"
    else
      "../src/theme/assets/#{input}"
    end
  end

  def file_url(input)
    "files/#{input}"
  end

  def customer_login_link(input)
    "<a href='/account/login' id='customer_login_link'>#{input}</a>"
  end

  def global_asset_url(input)
    "//cdn.shopify.com/s/global/#{input}"
  end

  def img_url(input, size)
    hash = input.to_json
    hash = JSON.parse(hash, :symbolize_names => true)

    if hash['image'.to_sym].kind_of?(String)
      "#{hash['image'.to_sym]}/?_#{size}.jpg"
    else
      "#{hash['image'.to_sym]['src'.to_sym]}/?_#{size}.jpg"
    end
  end

  def product_img_url(input, size)
    json = input.to_json

    if json.gsub(/["|']/, '') == input
      "#{input}/?_#{size}.jpg"
    else
      hash = JSON.parse(json, :symbolize_names => true)
      "#{hash['src'.to_sym]}/?_#{size}.jpg"
    end
  end

  def collection_img_url(input, size = nil)
    "The `collection_img_url` filter is deprecated. Use the `img_url` filter instead."
  end

  def link_to(input, url, title = nil)
    "<a href='#{url}' title='#{title}'>#{input}</a>"
  end

  def link_to_vendor(input)
    "<a href='collection.html' title='#{input}'>#{input}</a>"
  end

  def link_to_type(input)
    "<a href='collection.html' title='#{input}'>#{input}</a>"
  end

  def link_to_tag(input, tag = nil)
    "<a href='collection.html' title='#{input}'>#{input}</a>"
  end

  def link_to_add_tag(input, tag = nil)
    "<a href='collection.html' title='#{input}'>#{input}</a>"
  end

  def link_to_remove_tag(input, tag = nil)
    "<a href='collection.html' title='#{input}'>#{input}</a>"
  end

  def url_for_type(input)
    "collection.html"
  end

  def url_for_vendor(input)
    "collection.html"
  end

  def within(input, collection)
    input
  end

  def payment_type_img_url(input)
    assets = {
      :'visa' => "//cdn.shopify.com/s/assets/global/payment_types/creditcards_visa-e9f829d15f5ec3b1953ba8b9bc59b448ddb1ec9235ae70c7936178744cb31489.svg",
      :'master' => "//cdn.shopify.com/s/assets/global/payment_types/creditcards_master-94df290d56a3c6424296953282e18e46895ba94bdef368640eb52f8349915610.svg",
      :'american_express' => "//cdn.shopify.com/s/assets/global/payment_types/creditcards_american_express-54be4e6bfc1dbd42f93af603e102fde2356dfe2372a7dd851074964337533296.svg",
      :'paypal' => "//cdn.shopify.com/s/assets/global/payment_types/creditcards_paypal-dd71910a20fd73f78b4eed60e89331d4f4ceb38d55ef42e1e9935d78070ba3e2.svg",
      :'jcb' => "//cdn.shopify.com/s/assets/global/payment_types/creditcards_jcb-8f8079695e74d5688707997b208994c4d8078baa58b866ed47852cf9674d9332.svg",
      :'diners_club' => "//cdn.shopify.com/s/assets/global/payment_types/creditcards_diners_club-d07838507a213e5e52ef4272d3ccfe3da294642628264cd0934baf6878ceb197.svg",
      :'maestro' => "//cdn.shopify.com/s/assets/global/payment_types/creditcards_maestro-e2bbae787fceedc1ffffbc57b6fb487ec70a781b549dccbe8cb6c335f04c997e.svg",
      :'google_wallet' => "//cdn.shopify.com/s/assets/global/payment_types/creditcards_google_wallet.svg",
      :'discover' => "//cdn.shopify.com/s/assets/global/payment_types/creditcards_discover-96a6318d3deeede785ba12114a8d00bd23731f9f16e14ddcd0bdfd5e1d846307.svg",
      :'solo' => "//cdn.shopify.com/s/assets/global/payment_types/creditcards_solo-45cb0fbbcdcab59108d459100087afe1fb58b30a6f2de84bdf12fe5d2c103453.svg",
      :'switch' => "//cdn.shopify.com/s/assets/global/payment_types/creditcards_switch-e7989e629a63b619528b08c3ff54ee0d6ea733e0500e650acd6d3bf5077bdf4c.svg",
      :'laser' => "//cdn.shopify.com/s/assets/global/payment_types/creditcards_laser-5440f3fcdddd6b354a92670ef0473e446aed22e1c96f6e6381b20346612fbfd5.svg",
      :'dankort' => "//cdn.shopify.com/s/assets/global/payment_types/creditcards_dankort-b173653edc11a28324ed184bcd61735fc1855e73d643a01ddfc5725ea8056a61.svg",
      :'forbrugsforeningen' => "//cdn.shopify.com/s/assets/global/payment_types/creditcards_forbrugsforeningen-ba4af2dab3d288898e94f43470c5299e04f3df414dee7a5ed07df5a1ff8fca34.svg",
      :'dwolla' => "//cdn.shopify.com/s/assets/global/payment_types/creditcards_dwolla-fb1a5ac0b4aaf67d1fa6caf35ea3f7ebb6e1864fb9dee569967848f26dd0bad3.svg",
      :'bitcoin' => "//cdn.shopify.com/s/assets/global/payment_types/creditcards_bitcoin-4d4d7fba75da840a79283046ed1491138e986b3a57597cd7574fdbfe3f9e5605.svg"
    }

    asset = ''

    assets.each do |key, value|
      if "#{key}" == input
        asset = value
      end
    end

    asset
  end
end
Liquid::Template.register_filter(UrlFilters)


# Additional filters
module AdditionalFilters
  def json(input)
    input.to_json
  end

  def default_errors(input)
    input
  end

  def default_pagination(input)
    "
      <span class='previous'><a href='#' title=''>&laquo; Previous</a></span>
      <span class='page current'>1</span>
      <span class='page'><a href='#' title=''>2</a></span>
      <span class='page'><a href='#' title=''>3</a></span>
      <span class='next'><a href='#' title=''>Next &raquo;</a></span>
    "
  end

  def highlight(input, text)
    input.gsub(text, "<strong class='highlight'>#{text}</strong>")
  end

  def highlight_active_tag(input)
    input
  end

  def weight_with_unit(input, unit = "kg")
    "#{input} #{unit}"
  end
end
Liquid::Template.register_filter(AdditionalFilters)


# Dummy `{% paginate %}{% endpaginate %}` tag, all it does is render everything
# inside the tags
class Paginate < Liquid::Block
  def render(context)
    super
  end
end
Liquid::Template.register_tag('paginate', Paginate)


# Dummy `{% layout %}` tag, it doesn't actually render anything, I use the Gulp
# task to assemble the layouts
class Layout < Liquid::Tag
end
Liquid::Template.register_tag('layout', Layout)


# Dummy `{% form %}{% endform %}` tag, all it does is wrap the contents of the
# tag in a HTML `<form />`
class Form < Liquid::Block
  def render(context)
    "
      <form accept-charset='UTF-8' action='#' method='post'>
        #{super}
      </form>
    "
  end
end
Liquid::Template.register_tag('form', Form)


# Return generated HTML for usage in the Gulp task
template = Liquid::Template.parse( $template )
puts template.render( $data )