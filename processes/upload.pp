@main[][session;hConfig;hDefault;f;h;hFiles;sField;hFieldConf;sType;sFilePath;hResult]

$session[^math:uuid[]]
$hDefault[
	$.basePath[/r/]
	$.defaultType[data-file]
]
$hConfig[^json:parse[{
	^self.parseBlock[upload-config][$.bNoXML(1)]
}]]
$hConfing[^hConfig.union[$hDefault]]
$hConfig.basePath[/^hConfig.basePath.trim[both;/]/$session/]

$hResult[
	$.filePath[]
	$.code(1)
	$.preview[]
]

^if($form:files is "hash" && $hConfig.fields){
	^hConfig.fields.foreach[sField;hFieldConf]{
		^if(def $form:files.[$sField]){
			$f[$form:files.[$sField].0]
			$h[^self.verifyField[$f;$hFieldConf]]
			^if($h.result){
################ non-error code
				$hResult.code(0)
				$sFilePath[^self.saveField[$f;$hConfig.basePath]]
				$hFieldConf.type[^if(def $hFieldConf.type){$hFieldConf.type}{$hConfing.defaultType}]
				^switch[$hFieldConf.type]{
					^case[image]{
						$hResult.preview[^self.outputImage[$h.image;$sFilePath;$hFieldConf]]
						$hResult.preview[$hResult.preview^self.outputFile[$f]]
					}
					^case[DEFAULT]{
						$hResult.preview[^self.outputFile[$f]]
					}
					$hResult.filePath[$sFilePath]
				}
			}{
				$hResult.code(2)
			}
			^break[]
		}
	}
}

^json:string[$hResult]


@verifyField[f;hConf][tExt;sExt]
	
	$result[
		$.result(1)
	]
	^if(def $hConf.ext){
		$tExt[^hConf.ext.split[,;v;ext]]
		$sExt[^file:justext[$f.name]]
		^if(!^tExt.locate[ext;$sExt]){
			$result.result(0)
		}
	}
	^if($result.result && def $hConf.type){
		^if($hConf.type eq "image"){
			^try{
				$result.image[^image::measure[$f]]
			}{
				$result(0)
			}
		}
	}


@saveField[f;sBasePath][sPath]

	$sPath[${sBasePath}$f.name]
	^f.save[binary;$sPath]
	$result[$sPath]


@outputImage[image;sFilePath;hConf][sAttr]
	
	$sAttr[]
	^if(def $hConf.viewWidth && def $hConf.viewHeight){
		^if(^eval($image.width / $image.height) > ^eval($hConf.viewWidth / $hConf.viewHeight)){
			$sAttr[width="$hConf.viewWidth"]
		}{
			$sAttr[height="$hConf.viewHeight"]
		}
	}
	$result[<img src="$sFilePath" $sAttr title="" />]
	$result[^result.base64[]]


@outputFile[f]
	
	$result[<div class="form__field-preview-info">$f.name</div>]
	$result[^result.base64[]]
