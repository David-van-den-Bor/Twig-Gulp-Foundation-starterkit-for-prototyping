<?php
require_once __DIR__ . '/vendor/autoload.php';
// $loader = new Twig_Loader_Filesystem('views');
// $twig = new Twig_Environment($loader, array(
// 'cache' => 'cache',
// ));
// $template = $twig->load('page.twig');
// echo $template->render(array('name' => 'david', 'go' => 'here'));
define(	"ROOT",		'/nieuw-project/');
define( "ABS_ROOT", realpath(dirname(__FILE__)).'/');
//	REGISTER
//	LOADER
$loader	= new Twig_Loader_Filesystem( array(ABS_ROOT.'pages/'));
//	ENVIRONMENT
$twig			= new Twig_Environment($loader, array(
					'cache' => false //dirname(__FILE__).'/cache'
				));
$function		= new Twig_SimpleFunction('inc', function(Twig_Environment $env, $context, $template, $variables = array(), $withContext = true, $ignoreMissing = false, $sandboxed = false) {
					//	GET json filename
					$jsonFilename			= str_replace('.twig', '.json', $template);
					//	IF json default data exists
					if(file_exists(ABS_ROOT.'pages/'.$jsonFilename))
					{
						//	GET data
						$arrData			= json_decode(file_get_contents(ABS_ROOT.'pages/'.$jsonFilename), true);
						//	MERGE data into context
						foreach($arrData AS $key => $data)
						{
							if(!array_key_exists($key, $context))
							{
								$context[$key]	= $data;
							}
						}
					}
					//	INCLUDE and display template
					echo twig_include($env, $context, $template, $variables, $withContext, $ignoreMissing, $sandboxed);
				}, array('needs_environment' => true, 'needs_context' => true));
$twig->addFunction($function);
//	FILENAME SUFFIX filter
$function		= new Twig_SimpleFunction('defaultData', function(&$context) {
					$context['debug']= "this has changed!";
					$context['items']= array(
										"0"	=> array('date'		=> '1/1',
													 'headline'	=> 'Testing 12345678'),
										"1"	=> array('date'		=> '2/2',
													 'headline'	=> 'Testing 23456789')
									);
				}, array('needs_context'	=> true));
$twig->addFunction($function);
//	FILENAME SUFFIX filter
$filter			= new Twig_SimpleFilter('size_*', function ($suffix, $filename) {
					$dot_position	= strrpos($filename, ".");
					$filename_base	= substr($filename, 0, $dot_position);
					$filename_ext	= substr($filename, $dot_position);
					$newname		= $filename_base . '_' . $suffix . $filename_ext;
					return $newname;
				});
$twig->addFilter($filter);
//	ABRIDGE filter
$filter			= new Twig_SimpleFilter('char_limit_*', function ($intCharCount, $string) {
					if(strlen($string) < $intCharCount)
					{
						$string = substr($string, 0, $intCharCount).'...';
					}
					return $string;
				});
$twig->addFilter($filter);
/**
 * Page object, for doing all your pagey things.
 *
 * @author Phil M Price
 */
class Page {
    public	$json;
    public	$name;
    //  CONSTRUCT
    public function Page($name)
    {
        //  SET name
        $this->name     = $name;
    }
    //  GET an object by passing it's name.
    public static function getByName($name)
    {
        //  RETURN page object
        return new Page($name);
    }
	public static function getByPathArray($arrPath)
	{
		if(sizeof($arrPath) > 1)
		{
			$pageName		= $arrPath[1];
		}
		else
		{
			$pageName		= 'home';
		}
		return Page::getByName($pageName);
}
	//	GET data
	public function getData()
	{
		//	INIT
		$arrData			= array();
		//	IF this page has json
		if($this->hasJson())
		{
			//	GET data from json
			$arrData		= json_decode($this->getJson(), true);
		}
		return $arrData;
	}
    //  IS json available for this page?
    public function hasJson()
    {
        return file_exists('pages/'.$this->name.'.json');
    }
	public function getJson()
	{
		return file_get_contents('pages/'.$this->name.'.json');
	}
}
class ViewManager
{
	private $absPath	= '';
	public function ViewManager($absPath)
	{
		$this->absPath	= $absPath;
	}
	public function allMustacheToTwig()
	{
		//	GET tree for abs view path
		$this->mustacheToTwigFolder($this->absPath);
	}
	public function mustacheToTwigFolder($path)
	{
		//	INIT
		$objDir				= dir($path);
		//	READ sub-folders
		while(false !== ($entry = $objDir->read()))
		{
			//	IF not just dots
			if($entry != '.' &&
			   $entry != '..')
			{
				//	IF file
				if(is_file($path.$entry))
				{
					//	IF mustache file
					if(strpos($entry, '.mustache') !== false)
					{
						$newName	= str_replace('.mustache', '.twig', $entry);
						rename($path.$entry, $path.$newName);
					}
				}
				//	IF folder
				elseif(is_dir($path.$entry))
				{
					$this->mustacheToTwigFolder($path.$entry.'/');
				}
			}
		}
		$objDir->close();
	}
	public function getTreeData()
	{
		//	GET tree for abs view path
		$arrData		= $this->getFolderContents($this->absPath);
		return $arrData;
	}
	public function getFolderContents($path)
	{
		//	INIT
		$arrData			= array();
		$objDir				= dir($path);
		//	READ sub-folders
		while(false !== ($entry = $objDir->read()))
		{
			//	IF not just dots
			if($entry != '.'	&&
			   $entry != '..'	&&
			   $entry != 'template')
			{
				//	IF file
				if(is_file($path.$entry))
				{
					//	IF twig file
					if(strpos($entry, '.twig') !== false)
					{
						//	SET values
						$label		= ucwords(str_replace('.twig','',str_replace('-',' ',$entry)));
						$type		= 'file';
						$items		= null;
						$viewPath	= str_replace($this->absPath,'',$path.$entry);
						$viewType	= current(explode('/', $viewPath));
						switch(strtolower($viewType))
						{
							case 'template':
							case 'templates':
								$url	= null;
								break;
							case 'page':
							case 'pages':
								$url	= ROOT.str_replace('.twig','',$entry);
								break;
							default:
								$url	= ROOT.'?t='.$viewPath;
								break;
						}
					}
					//	IF not twig file, unset entry
					else
					{
						unset($entry);
					}
				}
				//	IF folder
				elseif(is_dir($path.$entry))
				{
					//	IF folder not core, not from mustache
					if($entry != '_core' && strpos($entry, '-') === false)
					{
						//	SET values
						$label		= ucwords(str_replace('-',' ',$entry));
						$type		= 'folder';
						$items		= $this->getFolderContents($path.$entry.'/');
						$url		= '#';
					}
					else
					{
						unset($entry);
					}
				}
				//	IF entry still exists
				if($entry)
				{
					//	ADD data
					$arrData[]	= array('type'		=> $type,
										'name'		=> $entry,
										'label'		=> $label,
										'url'		=> $url,
										'children'	=> $items);
				}
			}
		}
		$objDir->close();
		return $arrData;
	}
    public function getJsonForTwig($twigPath)
    {
        //  INIT
        $arrData                = array();
        $jsonPath	      		= str_replace('.twig', '.json', $twigPath);
        //  IF json file exists
        if(file_exists($this->absPath.$jsonPath))
        {
            //  DECODE json data
            $arrData			= json_decode(file_get_contents(ABS_ROOT.'pages/'.$jsonPath), true);
        }
        return $arrData;
    }
}
// end object view manager
//	GET page
$arrPath					= explode('/', trim($_SERVER['REQUEST_URI'], '/'));
$page						= Page::getByPathArray($arrPath);
//	GET view menu
$viewManager				= new ViewManager(ABS_ROOT.'pages/');
//	IF showing page
	//	SET data
	$arrData				= $page->getData();
	//	LOAD page template
	$template				= $twig->loadTemplate('/'.$page->name.'.twig');
//	SET global data
$arrData['root']			= ROOT;
$arrData['viewTree']		= $viewManager->getTreeData();
//	DISPLAY twig
$template->display($arrData);
?>