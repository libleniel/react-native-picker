require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'RNPicker'
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = package['homepage']
  s.license      = package['license']
  s.author       = { "author" => package['author']['name'] }
  s.platform     = :ios, "9.0"
  s.source       = { :git => "https://github.com/rbzthinker/react-native-picker.git", :tag => s.version }
  s.source_files = "ios/*.{h,m}"
  s.requires_arc = true

  s.dependency "React"

end