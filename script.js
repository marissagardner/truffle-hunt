// ============================================================
// Truffle Hunt -- script.js
// Extracted from inline <script> blocks in the original index.html
// (Version 2.5, JL Popyack -- see index.html header comment for history)
// ============================================================

		// ---------------------------------------------------------------------
		// GLOBAL CONSTANTS
		// ---------------------------------------------------------------------
		
			var DEVELOPER_MODE = false ;
			var RULEMAKER_MODE = false ;
			var SOLO_MODE      = false ;
			var DEVELOPER_RUN  = false ; 
			var Top=0, left=0, bottom=300, right=300;
// 			var xTop=400, xleft=0, xbottom=xTop+90, xright=xleft+90;
			var xTop=Top, xleft=0, xbottom=xTop+90, xright=xleft+90;
	
			var GRIDSIZE = 10 ;
			var MAX_TRUFFLES = GRIDSIZE ;
			var dh = (right-left)/GRIDSIZE;
			var dv = (bottom-Top)/GRIDSIZE;
	
			var GRIDLINE_THICKNESS = 1 ;
			var RULES ;
		
		// ---------------------------------------------------------------------
		// GLOBAL VARIABLES
		// ---------------------------------------------------------------------
			var ROW,COL ;           // used in doMouseDown(e), doFirstClick()
			var firstClick=true ;
			var gameOver = false ;
			var autoBoar = false ;
			var AUTO_BOAR_DELAY_MS = 1800 ;
			
		// =====================================================================
		// ------------------------- CLASS DEFINITION -------------------------- 
		// =====================================================================
		
		// ---------------------------------------------------------------------
		// The grid is an array2D of Elements.  Each element has these attributes:
		//   val    : number of truffles in its neighbor cells
		//   visible: whether the value has been revealed to the user
		//   truffle: whether the cell contains a truffle
		//   marked : whether the user has marked the cell as containing a truffle
		//            (the user may have marked it incorrectly)
		//   name   : name shown on the display , e.g., grid[4][1] is B4.
		//
		// The pattern and action display areas are also array2D of Elements.
		// CellStyle of these areas differs from the grid CellStyle.
		// ---------------------------------------------------------------------
			
		function array2D(numRows,numCols)
		{
			var arr = new Array(numRows) ;
			for(var i=0; i<arr.length; i++)
			{
				arr[i] = new Array(numCols) ;
				for(var j=0; j<arr[i].length; j++)
					arr[i][j] = new Element(0,false,false,false,                 // was -1
					                String.fromCharCode("A".charCodeAt(0)+j)+i) ;
			}
			return arr ;
		}
	
			function Element(val,visible,truffle,marked,name)
			{
				this.val = val ;
				this.visible = visible ;
				this.truffle = truffle ;
				this.marked = marked ;
				this.name = name ;
			}
			
			function CellStyle(fillColor,emptyColor,lineColor,markedColor,
							   digitColor,zeroColor,explodedColor)
			{
				this.fillColor = fillColor ;
				this.emptyColor = emptyColor ;
				this.lineColor = lineColor ;
				this.markedColor = markedColor ;
				this.digitColor = digitColor ;
				this.zeroColor = zeroColor ;
				this.explodedColor = explodedColor ;
			}
			
		// =====================================================================
		// ----------------------- END CLASS DEFINITION -----------------------
		// =====================================================================
			
	 
		// =====================================================================
		// -------------------- BINARY/DECIMAL/HEX ROUTINES --------------------
		// =====================================================================
	
		function Bin2Hex(binstr)
		{
		//----------------------------------------------------------------------
		// Convert binary string to hex, 4 bits at a time.
		// Assumes string length is a multiple of 4.
		//----------------------------------------------------------------------
			var hexstr = "" ;
			while(binstr != "")
			{
				var susbtr = binstr.substr(0,4) ;
				hexstr += parseInt(susbtr,2).toString(16).toUpperCase() ;
				binstr = binstr.substr(4,binstr.length-4) ;
			}
			return hexstr ;
		}
		
		function Hex2Bin(hexstr)
		{
		//----------------------------------------------------------------------
		// Convert hex string to binary, 1 hex byte at a time.
		//----------------------------------------------------------------------
			var binstr = "" ;
			while(hexstr != "")
			{
				var susbtr = hexstr.substr(0,1) ;
				binstr += parseInt(susbtr,16).toString(2).padStart(4,'0') ;
				hexstr = hexstr.substr(1,hexstr.length-1) ;
			}
			return binstr ;
		}

			
		// =====================================================================
		// -------------------END BINARY/DECIMAL/HEX ROUTINES ------------------
		// =====================================================================

		
		function countNeighbors(grid,row,col)
		{
		// ---------------------------------------------------------------------
		// Count the number of neighbors surrounding grid[row][col] that 
		// contain truffles.
		// ---------------------------------------------------------------------
			var nRows = grid.length ;
			var nCols = grid[0].length ;

			var count=0 ;
			for(var i=row-1; i<=row+1; i++)
				if(i>=0 && i<nRows)
					for(var j=col-1; j<=col+1; j++)
						if(j>=0 && j<nCols)
							if(i!=row || j!=col)
								if(grid[i][j].truffle)
									count++ ;
			return count ;
		}

				function transcript(message)
		{
		// ---------------------------------------------------------------------
		// Add a message to the transcript ("Truffle-Sniffing Boar Says") area
		// during gameplay. In Rule Maker mode, route the same messages to the
		// compact inline result banner next to "Check Rule" instead.
		// ---------------------------------------------------------------------
			
			if( RULEMAKER_MODE )
			{
				showRuleCheckStatus(message) ;
				return ;
			}

			var theForm = document.getElementById("transcriptArea") ;
			theForm.value += message + "\n" ;
			theForm.scrollTop = theForm.scrollHeight ;
		}

		function showRuleCheckStatus(message)
		{
		// ---------------------------------------------------------------------
		// Shows a single Check Rule result as a compact green/red banner,
		// replacing the old big transcript box in Rule Maker mode.
		// ---------------------------------------------------------------------

			var box = document.getElementById("ruleCheckStatus") ;
			var isError = ( message.indexOf("ERROR") == 0 || message.indexOf("does not match") >= 0 ) ;

			box.innerText = message ;
			box.className = isError ? "error" : "ok" ;
		}
		
		function enterSoloMode()
		{
		// ---------------------------------------------------------------------
		// Switches the page into SOLO_MODE: a plain human-only game, with no
		// boar and no Rule Center. Triggered either by loading the page with
		// "?solo" on the URL, or by clicking "Manual Play" on the landing page.
		// ---------------------------------------------------------------------
			SOLO_MODE = true ;
			document.getElementById("backToHomeButton").style.display = "inline-block" ;
			document.getElementById("soloInstructions").style.visibility = "visible" ;
			document.getElementById("autoControl").style.visibility = "hidden" ;
			document.getElementById("frmlabel1").style.visibility = "hidden" ;
			document.getElementById("frm1").style.visibility = "hidden" ;
			document.getElementById("ruleBadges").style.visibility = "hidden" ;
			document.getElementById("ruleMakerLink").style.visibility = "hidden" ;
			document.getElementById("patternheader").style.visibility = "hidden" ;
			document.getElementById("actionheader").style.visibility = "hidden" ;
		}

		function doFirstClick(grid,row,col)
		{
		// ---------------------------------------------------------------------
		// On first click, we guarantee none of the MAX_TRUFFLES truffles are in 
		// the position just clicked, or in any of its neighbors.  That is, the
		// first click is guaranteed to return a 0.
		// ---------------------------------------------------------------------
			document.getElementById("runButton").disabled = true ;
			document.getElementById("nextMoveButton").disabled = false ;

			var str = document.getElementById("gridstring").value ;
			// ---------------------------------------------------------------------
			// When in DEVELOPER_MODE, the user has the opportunity to enter a 
			// string depicting the "first click" location and  grid configuration
			// of a previously played game.
			// ---------------------------------------------------------------------
			if( str != "" )
			{
			// ---------------------------------------------------------------------
			// Benchmark configurations:
			// B7:0010052004A80000000000060  -- first 4 marks 5; complex marks 8
			// H5:01000000200041000001A2060  -- first 4 marks 6; complex solves
			// C2:2000100010004A40080400010  -- first 4 marks 4; complex marks 5
			// E4:0180400008002038003000000	 -- first 4 marks 6; complex marks 9
			// D6:021001A200100040180000000  -- first 4 marks 2; complex marks 9
			// H4:2000008000003A10800002001  -- first 4 marks 3; complex solves
			// D4:300003300001000008000A000  -- first 4 marks 3; complex solves
			// J2:300003300001000008000A000  -- first 4 marks 1; complex solves
			// F3:0041010000000082C88200000  -- first 4 marks 7; complex solves
			// ---------------------------------------------------------------------
			
				if( DEVELOPER_RUN )
				{
				// ---------------------------------------------------------------------
				// If in DEVELOPER MODE, the user may have entered a configuration,
				// but we only probe at the preset row and column if the Run button
				// has been clicked, not if a place in the grid has been clicked.
				// ---------------------------------------------------------------------
					ROW = str.charCodeAt(1) - "0".charCodeAt(0) ;
					COL = str.charCodeAt(0) - "A".charCodeAt(0) ;
				}
				var binstr = Hex2Bin( str.substr(3,str.length-3) ) ;
// 				document.getElementById("gridstring").value += "\n" + binstr ;

				var index = 0 ;
				for(var i=0; i<grid.length; i++)
					for(var j=0; j<grid[i].length; j++)
					{
						grid[i][j].val = (binstr[index] == "1") ? -1 : 0 ;
						grid[i][j].truffle = ( grid[i][j].val != 0 ) ;
						index++ ;
					}
			}
			else
			{
				// ---------------------------------------------------------------------
				// Temporarily insert a truffle in each of the 9 cells surrounding (and 
				// including) the cell that was clicked, i.e., grid[row][col] .
				// Note that if this cell is close to a boundary, there will be fewer
				// than 8 surrounding cells.
				// ---------------------------------------------------------------------
			
				for(var m=row-1; m<=row+1; m++)
				{
					for(var n=col-1; n<=col+1; n++)
					{
						// ----------------------------------------------------
						// Don't access the cell if it is close to a boundary.
						// ----------------------------------------------------
						if( m>=0 && m<GRIDSIZE && n>=0 && n<GRIDSIZE )
							grid[m][n].truffle = true ; 
					}
				}
			
				// ---------------------------------------------------------------------
				// Randomly insert truffles in spaces not already containing a truffle,
				// for a total of MAX_TRUFFLES "permanent" truffles. 
				// ---------------------------------------------------------------------
			
				for(var i=0; i<MAX_TRUFFLES; i++)
				{
					var m, n;
					do
					{
						m = Math.floor( GRIDSIZE*Math.random() ) ;
						n = Math.floor( GRIDSIZE*Math.random() ) ;
					} while(grid[m][n].truffle);
					grid[m][n].truffle = true ;
					grid[m][n].val = -1 ;
				}
			
				// ---------------------------------------------------------------------
				// Remove the truffles temporarily inserted above. 
				// ---------------------------------------------------------------------
			
				for(var m=row-1; m<=row+1; m++)
				{
					for(var n=col-1; n<=col+1; n++)
					{
						// ----------------------------------------------------
						// Don't access the cell if it is close to a boundary.
						// ----------------------------------------------------
						if( m>=0 && m<GRIDSIZE && n>=0 && n<GRIDSIZE )
							grid[m][n].truffle = false ; 
					}
				}
			
				// ---------------------------------------------------------------------
				// Store the "first click" location and  grid configuration in the
				// gridstring text box, which is visible in DEVELOPER MODE.
				// ---------------------------------------------------------------------
				str = pack(grid) ;
				document.getElementById("gridstring").value = grid[row][col].name + ":" 
				+ Bin2Hex(str);
			}	  
			
			// ---------------------------------------------------------------------
			// For each cell grid[i][j] in the grid, count the number of truffles 
			// in neighboring cells, and store this value in grid[i][j].val .  
			// This number does not change during the session.
			// ---------------------------------------------------------------------
		
			for(var i=0; i<grid.length; i++)
				for(var j=0; j<grid[i].length; j++)
					if(!(grid[i][j].truffle))
							grid[i][j].val = countNeighbors(grid,i,j) ;
		}
		
		
		function rotateRight(matrix)
		{
		// ---------------------------------------------------------------------
		// Returns a grid with elements found by rotating matrix clockwise.
		// ---------------------------------------------------------------------

			var nRows = matrix.length ;
			var nCols = matrix[0].length ;
			
			var mR = new array2D(nRows,nCols) ;
			for(var i=0; i<nRows; i++)
				for(var j=0; j<nCols; j++)
					mR[i][j] = matrix[nCols-1-j][i] ;
			return mR ;
		}
		
		function unpack(patternString)
		{
		// ---------------------------------------------------------------------
		// Converts a string of n^2 elements into an nxn matrix.
		// ---------------------------------------------------------------------
			
			// ---------------------------------------------------------------------
			// Figure out dimensions of matrix.
			// ---------------------------------------------------------------------
			var gridSize = Math.floor( Math.sqrt( patternString.length ) + 0.5 ) ;
			if( patternString.length != gridSize*gridSize )
				alert("Warning: string length is " + patternString.length 
				      + ", incorrect size.") ;
				      
			var matrix = new array2D(gridSize,gridSize) ;
			var index=0 ;
			for(var i=0; i<gridSize; i++)
			{
				for(var j=0; j<gridSize; j++)
				{
 					matrix[i][j] = new Element(patternString[index],true,false,false,
 					                   String.fromCharCode("P".charCodeAt(0)+i)+j) ;
					index++ ;
				}
			}
			return matrix ;
		}
			
		function pack(matrix)
		{
		// ---------------------------------------------------------------------
		// Converts an mxn grid into a string of mxn elements.
		// ---------------------------------------------------------------------

			var str = "" ;
			
			for(var i=0; i<matrix.length; i++)
			{
				for(var j=0; j<matrix[i].length; j++)
				{
 					str += (-matrix[i][j].val) ;
				}
			}
			return str ;
		}
			
		
		function matching(grid, row, col, pattern) // returns bool
		{
		// ---------------------------------------------------------------------
		// Checks whether pattern matches 3x3 grid centered at grid.cell[row,col]
		// ---------------------------------------------------------------------

			var isMatch = true ;
			for(var m=-1; isMatch && m<=1; m++)
			{
				for(var n=-1; isMatch && n<=1; n++)
				{
					var token = pattern[m+1][n+1].val ;
					if( row+m<0 || row+m>=GRIDSIZE )  // row out of bounds
						isMatch = token=="?" || token=="n" 
						       || token=="N" ;  
					else if( col+n<0 || col+n>=GRIDSIZE )  // col out of bounds
						isMatch = token=="?" || token=="n" 
						       || token=="N" ;  
					else if( token=="?" )  // anything
						isMatch = true ;
					else if( token=="m" )   // marked 
						isMatch = grid[row+m][col+n].marked ;       
					else if( token=="-" )  // unexplored
						isMatch = !(grid[row+m][col+n].visible) ;
					else if( token=="n" )  // a visible digit >=0
						isMatch = (grid[row+m][col+n].visible 
						        && grid[row+m][col+n].val>=0
						        && grid[row+m][col+n].val<9) ;
					else if( token=="N" )  // a visible digit >0
						isMatch = (grid[row+m][col+n].visible 
						        && grid[row+m][col+n].val>0 
						        && grid[row+m][col+n].val<9) ;
					else // specific number 0..8
						isMatch = grid[row+m][col+n].visible 
						      && (grid[row+m][col+n].val == token) ;
				}
			}

			return isMatch ;
		}
		
		function displayMove(grid, row, col, pattern, action)
		{
		// ---------------------------------------------------------------------
		// Show current subgrid being checked, along with pattern and action
		// ---------------------------------------------------------------------

			var numrows = Math.min(row+2,GRIDSIZE-row+1,3) ;
			var numcols = Math.min(col+2,GRIDSIZE-col+1,3) ;
			var firstrow = Math.max(row-1,0) ;
			var firstcol = Math.max(col-1,0) ;
			
			var subgrid = new array2D(numrows,numcols) ;
			
 			var rownumbers = "" ;

			for(var m=0; m<numrows; m++)
			{
			// -------------------------------------------------------------
			// row numbers printed to left of subgrid
			// -------------------------------------------------------------
				var rownum = String.fromCharCode("0".charCodeAt(0)+firstrow+m) ;			    
			    rownumbers += rownum + "<br />" ;
			}

 			var columnlabels = "    " ;
			for(var n=0; n<numcols; n++)
			{
			// -------------------------------------------------------------
			// column labels printed above subgrid
			// -------------------------------------------------------------
				var column = String.fromCharCode("A".charCodeAt(0)+firstcol+n) ;			
			    columnlabels += column + " " ;
			}
			    
			for(var m=0; m<numrows; m++)
			{
				for(var n=0; n<numcols; n++)
				{
					subgrid[m][n] = grid[firstrow+m][firstcol+n] ;
				}
			}
			
			document.getElementById("subgridheader").innerHTML = columnlabels ;
			document.getElementById("subgridrownum").innerHTML = rownumbers ;

			fillGrid(canvas2B,patternStyle,pattern) ; 
			drawGrid(canvas2B,patternStyle,xTop,xleft,xbottom,xright,dh,dv) ;
			
			fillGrid(canvas2A,gridStyle,subgrid) ;
			drawGrid(canvas2A,gridStyle,xTop,xleft,
				xTop+subgrid.length*dv,subgrid[0].length*dh,
				dh,dv) ;

			fillGrid(canvas2C,patternStyle,action) ;
			drawGrid(canvas2C,patternStyle,xTop,xleft,xbottom,xright,dh,dv) ;

		}
		
		function apply(grid, row, col, pattern, action)
		{
		// ---------------------------------------------------------------------
		// Apply given action to subgrid centered at grid[row][col]
		// ---------------------------------------------------------------------

			displayMove(grid, row, col, pattern, action);
			
			for(var m=-1; m<=1; m++)
			{
				for(var n=-1; n<=1; n++)
				{
					if( action[m+1][n+1].val=="P" )
					{
						probe("I",grid,row+m,col+n) ;
						return ;
					}
		
					if( action[m+1][n+1].val=="M" )
					{
						placeMarker("I",grid,row+m,col+n) ;
						return ;
					}
				}
			}
		}
		
		function rulesAreValid()
		{
		// ---------------------------------------------------------------------
		// Error checking for rules provided by user in Rule Center
		// ---------------------------------------------------------------------

			var LEGAL_PATTERN_CHARS = "012345678Nn-?m" ;
			var LEGAL_ACTION_CHARS  = "?PM" ;
			
			// ---------------------------------------------------------------------
			// Check rules entered by user for validity.
			// The following errors are caught:
			//    Odd number of lines entered (rules are pattern/action pairs)
			//    Blank lines not allowed
			//    Line lengths not equal to 9
			//       some exceptions are allowed: 
			//          comments (following //) are permitted at the end of the line
			//          spaces are trimmed from beginning and end after comments
			//             are removed
			//    Illegal characters in either pattern or action string
			// ---------------------------------------------------------------------
			
			// ---------------------------------------------------------------------
			// Retrieve rule list from user
			// ---------------------------------------------------------------------
			RULES = document.getElementById("ruleList").value ;
			  
			// ---------------------------------------------------------------------
			// Remove spurious spaces before or after rules
			// ---------------------------------------------------------------------
			RULES = RULES.trim() ;
			
			// ---------------------------------------------------------------------
			// Convert text into array of lines 
			// ---------------------------------------------------------------------

			RULES = RULES.split("\n") ; 
			
			
			// ---------------------------------------------------------------------
			// Begin transcript of all errors detected in rule list
			// ---------------------------------------------------------------------

			var errors = "" ;    
			
			// ---------------------------------------------------------------------
			// A rule must contain 2 lines (a pattern and an action)		
			// ---------------------------------------------------------------------

			var numRules = RULES.length/2 ; 
			if( RULES.length%2 != 0)
				errors += "*  Uneven number of lines in (pattern,action) pairs, " 
				       + RULES.length + " lines found.\n";
							
			// ---------------------------------------------------------------------
			// Examine rules, line by line		
			// ---------------------------------------------------------------------

			for(var i=0; i<RULES.length; i++)
			{
				// ---------------------------------------------------------------------
				// Remove comment from end of line, if any
				// ---------------------------------------------------------------------

				var commentPos = RULES[i].search("//") ;  
				if( commentPos >= 0 )
					RULES[i] = RULES[i].substr(0,commentPos);
					
				// ---------------------------------------------------------------------
				// Remove blanks from beginning and end of text, if any
				// ---------------------------------------------------------------------

				RULES[i] = RULES[i].trim() ;  
				
				// ---------------------------------------------------------------------
				// Blank lines are not allowed
				// ---------------------------------------------------------------------

				if( RULES[i].length==0 )
					errors += "*  Blank line found in rule list\n" ;
					
				// ---------------------------------------------------------------------
				// The remaining rule must contain 9 characters
				// ---------------------------------------------------------------------

				else if( RULES[i].length != 9 )  
					errors += "*  \"" + RULES[i] + "\" should contain 9 characters, " 
					       + RULES[i].length + " found.\n" ;
					
				// ---------------------------------------------------------------------
				// Rule must contain legal characters, which differ for 
				// Patterns and Actions
				// ---------------------------------------------------------------------

				var badchars = "" ; 
				var temp = "" ;
				if( i%2 == 0 )  // this is a pattern string
				{
					temp = "Pattern " ;
					for(let ch of RULES[i])
						if( !( LEGAL_PATTERN_CHARS.includes(ch) ))
							badchars += ch ;						
				}
				else  // this is an action string
				{
					temp = "Action "
					for(let ch of RULES[i])
						if( !( LEGAL_ACTION_CHARS.includes(ch) ))
							badchars += ch ;						
				}
				var suffix = ( badchars.length > 1) ? "s" : "" ;
				if( badchars.length>0 )
					errors += "*  Illegal character" + suffix + " \"" + badchars 
					        + "\" found in " + temp + "\"" + RULES[i] + "\n" ;
			}
			
			// ---------------------------------------------------------------------
			// Alert user about all errors discovered in rule list
			// ---------------------------------------------------------------------

			suffix = ( errors.length > 1) ? "S" : "" ;
			if( errors.length>0 )
//				alert("ERROR" + suffix + "!\n"+ errors) ;
				transcript("ERROR" + suffix + "!\n"+ errors) ;
		
			return ( errors.length==0 ) ;

		}
			
		function makeRule()
		{
		// ---------------------------------------------------------------------
		// In RULEMAKER_MODE, check if Pattern and Action entered by user have
		// appropriate syntax.  If so, apply Pattern and Action to subgrid.
		// If not, alert user with error messages.
		// ---------------------------------------------------------------------
		
			var SUBGRIDSIZE = 3 ;
			var subgrid = new array2D(SUBGRIDSIZE,SUBGRIDSIZE) ;
			var patternString = "" ;
			var actionString  = "" ;
			
			document.getElementById("transcriptArea").value = "" ; // reset transcript to empty
			
			for(var row=0; row<subgrid.length; row++)
			{
				var rowname = String.fromCharCode("0".charCodeAt(0)+row) ;
				
				for(var col=0; col<subgrid[row].length; col++)
				{
					var colname = String.fromCharCode("0".charCodeAt(0)+col) ;
					subgrid[row][col].val = document.getElementById("SGR"+rowname+colname).value ;
					subgrid[row][col].visible = ( subgrid[row][col].val != "" )
					
					// an m/M in the subgrid indicates a marker
					subgrid[row][col].marked  = ( subgrid[row][col].val.toUpperCase() == "M" )
// 					if( subgrid[row][col].marked )
						
					
					patternString += document.getElementById("PAT"+rowname+colname).value ;
					actionString  += document.getElementById("ACT"+rowname+colname).value ;
				}
			}
			document.getElementById("ruleList").value = patternString +"\n" + actionString ;
			
			var pattern = unpack(patternString) ;
			var action  = unpack(actionString) ;
			
			if( rulesAreValid() )
			{
				transcript("Pattern and Action have valid form.") 
				if (matching(subgrid, 1, 1, pattern))
				{
					transcript("Pattern matches Test Grid.") 
					apply(subgrid, 1, 1, pattern, action);
					transcript("Action applied to Test Grid.") 
				}
				else
					transcript("Pattern does not match Test Grid.") 
				
			}
		}

		function updateRulePreview()
		{
		// ---------------------------------------------------------------------
		// Rule Maker: live-updates the "Your rule so far" preview as the
		// student types into the Pattern/Action grids, so the connection
		// between the grid cells and the underlying 9-character rule
		// strings is visible before clicking Check Rule.
		// ---------------------------------------------------------------------

			var patternString = "" ;
			var actionString  = "" ;

			for(var row=0; row<3; row++)
			{
				var rowname = String.fromCharCode("0".charCodeAt(0)+row) ;
				for(var col=0; col<3; col++)
				{
					var colname = String.fromCharCode("0".charCodeAt(0)+col) ;
					patternString += document.getElementById("PAT"+rowname+colname).value || "?" ;
					actionString  += document.getElementById("ACT"+rowname+colname).value || "?" ;
				}
			}

			document.getElementById("rulePreview").innerHTML = 
				"Your rule so far:<br>Pattern: <b>" + patternString + 
				"</b>&nbsp;&nbsp;&nbsp;Action: <b>" + actionString + "</b>" ;
		}
		
		function findBoarMove(grid)
		{
		// ---------------------------------------------------------------------
		// Runs the exact same rule search agentAnalysis() used to run inline,
		// but makes no move -- it only records what it tried, in order, so the
		// UI can explain the boar's reasoning before acting on it.
		//
		// Returns:
		//   moveFound     : true/false
		//   row, col      : cell the boar decided to act on (if moveFound)
		//   pattern       : the (possibly rotated) pattern matrix that matched
		//   action        : the (possibly rotated) action matrix to apply
		//   rotationLabel : plain-English description of which orientation matched
		//   trace         : one entry per rule tried, in priority order:
		//                    { rule, matched, row, col, rotationLabel }
		// ---------------------------------------------------------------------

		var numRules = RULES.length/2 ;
		var patternString = new Array(numRules) ;
		var actionString  = new Array(numRules) ;
		var j = 0 ;
		for(var i=0; i<numRules; i++)
		{
			patternString[i] = RULES[j] ; j++ ;
			actionString[i]  = RULES[j] ; j++ ;
		}

		var ROTATION_LABELS = [ "its original orientation", "rotated 90° clockwise",
								"rotated 180°", "rotated 270° clockwise" ] ;

		var trace = [] ;
		var moveFound = false ;
		var resultRow, resultCol, resultPattern, resultAction, resultRotationLabel ;

		for (var k = 0; !moveFound && k < patternString.length; k++)
		{
			var pat = [ unpack(patternString[k]) ] ;
			pat[1] = rotateRight(pat[0]) ;
			pat[2] = rotateRight(pat[1]) ;
			pat[3] = rotateRight(pat[2]) ;

			var act = [ unpack(actionString[k]) ] ;
			act[1] = rotateRight(act[0]) ;
			act[2] = rotateRight(act[1]) ;
			act[3] = rotateRight(act[2]) ;

			var matchedHere = false ;

			for (var i=0; !matchedHere && i<grid.length; i++)
			{
				for (var cc=0; !matchedHere && cc<grid[i].length; cc++)
				{
					for (var r=0; !matchedHere && r<4; r++)
					{
						if ( matching(grid, i, cc, pat[r]) )
						{
							matchedHere = true ;
							resultRow = i ;
							resultCol = cc ;
							resultPattern = pat[r] ;
							resultAction  = act[r] ;
							resultRotationLabel = ROTATION_LABELS[r] ;
						}
					}
				}
			}

			trace.push( { rule: k+1, matched: matchedHere,
						row: resultRow, col: resultCol,
						rotationLabel: resultRotationLabel } ) ;

			if (matchedHere)
				moveFound = true ;
		}

		return { moveFound: moveFound, row: resultRow, col: resultCol,
				pattern: resultPattern, action: resultAction,
				rotationLabel: resultRotationLabel, trace: trace } ;
		}

		function renderReasoning(result)
		{
		// ---------------------------------------------------------------------
		// Turns a findBoarMove() result into a short, plain-English play-by-play
		// in the reasoning panel -- this is what makes "the boar moved" into
		// "here's why the boar moved."
		// ---------------------------------------------------------------------

			var lines = [] ;

			for (var i=0; i<result.trace.length; i++)
			{
				var entry = result.trace[i] ;
				if (entry.matched)
					lines.push("Trying Rule " + entry.rule + " against the whole board... "
							+ "<strong>matched!</strong> Using it " + entry.rotationLabel
							+ ", centered at " + grid[entry.row][entry.col].name + ".") ;
				else
					lines.push("Trying Rule " + entry.rule + " against the whole board... no match.") ;
			}

			if (!result.moveFound)
				lines.push("<em>No rule matched anywhere on the board &mdash; "
						+ "the boar has no safe move to suggest.</em>") ;

			document.getElementById("reasoningPanel").innerHTML = lines.join("<br />") ;
		}

		function renderRuleBadges(matchedRuleNumber)
		{
		// ---------------------------------------------------------------------
		// Reads the Rule Center textarea and draws one numbered badge per rule,
		// in priority order -- so "which rule is this" and "what order do they
		// fire in" are visible at a glance instead of implied by line position
		// in a textarea. Pass the rule number that just fired to highlight it
		// (e.g. from findBoarMove()'s trace); omit it to just refresh the list.
		// ---------------------------------------------------------------------

			var rulesText = document.getElementById("ruleList").value.trim() ;
			var ruleLines = ( rulesText === "" ) ? [] : rulesText.split("\n") ;
			var numRules = Math.floor( ruleLines.length / 2 ) ;

			var container = document.getElementById("ruleBadges") ;
			container.innerHTML = "" ;

			for (var i=1; i<=numRules; i++)
			{
				var badge = document.createElement("span") ;
				badge.className = "ruleBadge" + ( i === matchedRuleNumber ? " ruleBadgeMatched" : "" ) ;
				badge.innerText = "Rule " + i ;
				container.appendChild(badge) ;
			}
		}

		function takeBoarTurn()
		{
		// ---------------------------------------------------------------------
		// Performs exactly one boar move: search for a matching rule, narrate
		// the search in the reasoning panel, apply the move if one was found,
		// and redraw the board. This is the single engine behind both the
		// "Next Move" button and Auto Boar -- Auto Boar just calls this
		// repeatedly on a timer instead of waiting for a click.
		// ---------------------------------------------------------------------

			if (gameOver)
				return ;

			// Board clicks no longer trigger this directly, so -- unlike the old
			// agentAnalysis() -- rule validity isn't guaranteed to have been
			// checked already. Check it here instead.
			if ( !(rulesAreValid()) )
				return ;

			var context = canvas.getContext("2d") ;
			context.restore() ;

			var result = findBoarMove(grid) ;
			renderReasoning(result) ;
			renderRuleBadges( result.moveFound ? result.trace[result.trace.length-1].rule : null ) ;

			if (result.moveFound)
			{
				apply(grid, result.row, result.col, result.pattern, result.action) ;
			}
			else
			{
				transcript("Your guess is as good as mine!\n") ;
				var stats = "Markers: " + document.getElementById("markerStatus").innerText ;
				document.getElementById("gridstring").value += "\nSTOPPED" + "\n" + stats ;
			}

			fillGrid(canvas,gridStyle,grid) ;
			drawGrid(canvas,gridStyle,Top,left,bottom,right,dh,dv) ;
			checkForWin(canvas,grid) ;

			if (result.moveFound)
			{
				// ---------------------------------------------------------------------
				// Draw a 3x3 square on the grid showing the position the boar
				// just examined.
				// ---------------------------------------------------------------------
				context.save() ;

				context.globalAlpha = 0.5 ;
				context.fillStyle = "AliceBlue" ;
				context.fillRect(left+(result.col-1)*dh, Top+(result.row-1)*dv, 3*dv, 3*dh) ;
				context.stroke() ;

				context.strokeStyle = "Sienna" ;
				context.beginPath() ;
				context.moveTo(left+(result.col-1)*dh, Top+(result.row-1)*dv) ;
				context.lineTo(left+(result.col+2)*dh, Top+(result.row-1)*dv) ;
				context.lineTo(left+(result.col+2)*dh, Top+(result.row+2)*dv) ;
				context.lineTo(left+(result.col-1)*dh, Top+(result.row+2)*dv) ;
				context.lineTo(left+(result.col-1)*dh, Top+(result.row-1)*dv) ;
				context.stroke() ;
				context.globalAlpha = 1.0 ;
			}

			if (result.moveFound && !gameOver && autoBoar)
				scheduleNextBoarTurn() ;
		}

		function scheduleNextBoarTurn()
		{
		// ---------------------------------------------------------------------
		// Auto Boar's "keep going on its own" behavior -- same single-move
		// function a human uses via "Next Move", just re-triggered on a timer.
		// ---------------------------------------------------------------------
			setTimeout(takeBoarTurn, AUTO_BOAR_DELAY_MS) ;
		}
		

// ------------------------------------------------------------
// Initialization code (originally the second inline <script> block,
// located at the end of <body> so the DOM elements above already exist)
// ------------------------------------------------------------
		//-----------------------------------------------------------------------
		// Are we in DEVELOPER MODE?  
		// Look for occurrence of "?dev", i.e.
		//   https:// .... /TruffleHunt ... .html?dev
		//-----------------------------------------------------------------------
			DEVELOPER_MODE = (location.search == "?dev") ;

			document.getElementById("devInfoLabel").style.visibility = 
				( DEVELOPER_MODE ) ? "visible" : "hidden" ;
			document.getElementById("devInfo").style.visibility = 
				( DEVELOPER_MODE ) ? "visible" : "hidden" ;
			document.getElementById("runButton").style.visibility = 
				( DEVELOPER_MODE ) ? "visible" : "hidden" ;

			document.getElementById("runButton").addEventListener("click", doMouseDown);
			
		//-----------------------------------------------------------------------
		// Are we in RULEMAKER MODE?  
		// Look for occurrence of "?rul", i.e.
		//   https:// .... /TruffleHunt ... .html?rul
		//-----------------------------------------------------------------------
			RULEMAKER_MODE = (location.search == "?rul") ;

			document.getElementById("mainFormElements").style.display = 
				( RULEMAKER_MODE ) ? "none" : "block" ;

			document.getElementById("ruleFormElements").style.display = 
				( RULEMAKER_MODE ) ? "block" : "none" ;

			document.getElementById("dblabel").style.display = 
				( RULEMAKER_MODE ) ? "none" : "block" ;

			document.getElementById("db").style.display = 
				( RULEMAKER_MODE ) ? "none" : "block" ;

			document.getElementById("reasoningLabel").style.display = 
				( RULEMAKER_MODE ) ? "none" : "block" ;

			document.getElementById("reasoningPanel").style.display = 
				( RULEMAKER_MODE ) ? "none" : "block" ;

			document.getElementById("subgridheader").style.display = 
				( RULEMAKER_MODE ) ? "none" : "inline" ;

			document.getElementById("subgridrownum").style.display = 
				( RULEMAKER_MODE ) ? "none" : "inline" ;

			document.getElementById("patternheader").style.display = 
				( RULEMAKER_MODE ) ? "none" : "block" ;
				
			document.getElementById("actionheader").style.display = 
				( RULEMAKER_MODE ) ? "none" : "block" ;

			var loc = location.href ;
			loc = loc.replace(/\?\w*/, '') ; // remove ?rul or ?dev
			var dest = ( RULEMAKER_MODE ) ? loc + "?auto" : loc + "?rul" ;
			var text = ( RULEMAKER_MODE ) ? "Back to Game" : "Rule Maker Mode" ;
			
			document.getElementById("ruleMakerLink").innerHTML = 
				"<a href=" + dest + ">" + text + "</a>";

			if( RULEMAKER_MODE )
			{
				document.getElementById("pageHeader").innerText += " Rule Maker" ;
				document.getElementById("ruleList").innerText += "" ;

				document.getElementById("ruleFormElements").addEventListener("input", function(e){
					if( e.target.id.indexOf("PAT")==0 || e.target.id.indexOf("ACT")==0 )
						updateRulePreview() ;
				}) ;
				updateRulePreview() ;
			}

			
		//-----------------------------------------------------------------------
		// Are we in SOLO MODE?  
		// Look for occurrence of "?solo", i.e.
		//   https:// .... /TruffleHunt ... .html?solo
		// (Also reachable from the landing page's "Manual Play" button --
		// see enterSoloMode() and the landing page logic below.)
		//-----------------------------------------------------------------------
			SOLO_MODE = (location.search == "?solo") ;
			document.getElementById("soloInstructions").style.visibility = "hidden" ;
			if( SOLO_MODE )
				enterSoloMode() ;

		//-----------------------------------------------------------------------
		// Landing page: on a bare URL (no query string at all), show a
		// landing page with "Manual Play" / "Auto-Boar" buttons instead of
		// dropping the user straight into a game. Direct links like "?solo",
		// "?rul", and "?dev" skip the landing page entirely, so existing
		// bookmarks/links keep working exactly as before.
		//-----------------------------------------------------------------------
			if( location.search == "" )
			{
				document.getElementById("manualPlayButton").addEventListener("click", function()
				{
					document.getElementById("landingPage").style.display = "none" ;
					enterSoloMode() ;
				}) ;

				document.getElementById("autoBoarButton").addEventListener("click", function()
				{
					document.getElementById("landingPage").style.display = "none" ;
					document.getElementById("backToHomeButton").style.display = "inline-block" ;
				}) ;
			}
			else
			{
				document.getElementById("landingPage").style.display = "none" ;
				document.getElementById("backToHomeButton").style.display = "inline-block" ;
			}

		//-----------------------------------------------------------------------
		// Back to home buttom: in both Solo and Auto mode, show a Home button 
		// that brings the user back to the landing page.
		//-----------------------------------------------------------------------
			document.getElementById("backToHomeButton").addEventListener("click", function()
			{
				// Reload the bare page (no query string) so the landing page
				// reappears and the game/rules/transcript all start fresh.
				location.href = location.pathname ;
			}) ;	

		//-----------------------------------------------------------------------
		// "Next Move" button: performs exactly one boar turn on demand.
		// Disabled until the first click has placed the truffles (see
		// doFirstClick()).
		//-----------------------------------------------------------------------
			document.getElementById("nextMoveButton").addEventListener("click", takeBoarTurn) ;

			
		var grid = new array2D(GRIDSIZE,GRIDSIZE);  
		
		var canvas = document.getElementById("myCanvas");
		var gridStyle = new CellStyle("DarkSeaGreen","PeachPuff","PeachPuff",
									  "#F88","DarkBlue","#FFF","#F00") ; 
	
		var canvas2A = document.getElementById("myCanvas2A");  // subgrid view
		var canvas2B = document.getElementById("myCanvas2B");  // pattern
		var canvas2C = document.getElementById("myCanvas2C");  // action
		var patternStyle = new CellStyle("Gainsboro","Gainsboro","black",
										 "#F88","DarkBlue","#FFF","#F00") ; 

//		canvas.addEventListener("mousedown", doMouseDown, false);
		canvas.addEventListener("mouseup", doMouseDown, false);			
// 		if( RULEMAKER_MODE )
// 			canvas2A.addEventListener("mouseup", doMouseDown, false);

		// ---------------------------------------------------------------------
		// This disables the "right-click context menu" 
		//   ("save image as...", etc.) inside the canvas
		// ---------------------------------------------------------------------
		canvas.oncontextmenu   = function (e) { e.preventDefault(); };
// 		canvas2A.oncontextmenu = function (e) { e.preventDefault(); };
		

		var context = canvas.getContext("2d");
		
		function finishGame(status,message)
		{
			gameOver = true ;
			var stats = "Markers: " + document.getElementById("markerStatus").innerText ;
			document.getElementById("gridstring").value += "\n" + status + "\n" + stats ;
			transcript(message) ;
		}

		function placeMarker(who, grid, row, col)
		{
			// ---------------------------------------------------------------------
			// Place a marker in the selected cell, indicating that it 
			// is presumed to contain a truffle.
			// ---------------------------------------------------------------------

			if( !grid[row][col].visible )
			{
			// ---------------------------------------------------------------------
			// currently is not visible (hasn"t been probed or marked).
			// so make it visible, and mark it.
			// ---------------------------------------------------------------------
				grid[row][col].visible = true ;
				grid[row][col].marked = true ;
				transcript(who+" put a marker at " + grid[row][col].name) ;
			}
			else if(grid[row][col].marked)
			{
			// ---------------------------------------------------------------------
			// currently is visible (has been probed or marked).
			// unmark it, and make it not visible.
			// ---------------------------------------------------------------------
				grid[row][col].visible = false ;
				grid[row][col].marked = false ;
				transcript(who+" removed a marker from " + grid[row][col].name) ;
			}
			// ---------------------------------------------------------------------
			// otherwise is visible and unmarked (has been probed, with number showing).
			// ignore.
			// ---------------------------------------------------------------------
		}
		
		function probe(who, grid, row, col)
		{
			// ---------------------------------------------------------------------
			// Probe the selected cell, to determine how many neighbors contain
			// truffles.
			// ---------------------------------------------------------------------

			// ---------------------------------------------------------------------
			// ignore attempt to probe a cell that has already been probed.
			// ---------------------------------------------------------------------
			if(grid[row][col].visible)
				return ;
			
			transcript(who + " probed at " + grid[row][col].name) ;  
			grid[row][col].visible = true ;
			
			// ---------------------------------------------------------------------
			// If the cell that was probed contains a truffle, the boar eats it
			// and the game ends.
			// ---------------------------------------------------------------------
			if(grid[row][col].truffle)
				finishGame("LOSS","Yummy! I can't believe I ate the whole thing!\nGAME OVER.");

		}

		function drawGrid(canvas,style,top,left,bottom,right,dh,dv)
		{
		// ---------------------------------------------------------------------
		// Draw the grid, with appropriate styling depending on whether it is
		// the main grid or a pattern/action grid.	
		// ---------------------------------------------------------------------
			var context = canvas.getContext("2d");
			
			context.lineWidth = GRIDLINE_THICKNESS ;
			context.strokeStyle = style.lineColor ;
			
			// ---------------------------------------------------------------------
			// Draw horizontal lines	
			// ---------------------------------------------------------------------
			for(var v=top; v<bottom; v=v+dv)
			{
				context.moveTo(left,v);
				context.lineTo(right,v);
			}

			// ---------------------------------------------------------------------
			// Draw vertical lines	
			// ---------------------------------------------------------------------
			for(var h=left; h<right; h=h+dh)
			{
				context.moveTo(h,top);
				context.lineTo(h,bottom);
			}

			context.stroke();	

			context.strokeStyle = "black" ;

			// Draw outline	
			context.beginPath();
			context.moveTo(left+1,top+1);
			context.lineTo(right-1,top+1);
			context.lineTo(right-1,bottom-1);
			context.lineTo(left+1,bottom-1);
			context.lineTo(left+1,top+1);

			context.stroke();	
		}

		function checkForWin(canvas,grid)
		{
		// ---------------------------------------------------------------------
		// Count markers and correctly marked cells to check for Win.
		// ---------------------------------------------------------------------
			var correctlyMarked = 0 ;
			var numMarkers = 0 ;   // Number of markers that have been placed
			for(var i=0; i<grid.length; i++)
				for(var j=0; j<grid[i].length; j++)
				{					
					if(grid[i][j].marked)
					{
						numMarkers++ ;
						if(grid[i][j].truffle)
							correctlyMarked++ ;
					}
				}
			
			document.getElementById("markerStatus").innerText = numMarkers ;
			if( DEVELOPER_MODE && correctlyMarked!=numMarkers )
				document.getElementById("markerStatus").innerText += "; " + correctlyMarked
					 + " placed correctly." 

			// ---------------------------------------------------------------------
			// Game ends if all truffles have been correctly marked.
			// This could be moved to a different routine.
			// ---------------------------------------------------------------------
		
			if(correctlyMarked==numMarkers && numMarkers==MAX_TRUFFLES)
			{
				finishGame("WIN","\n\n*** YOU WIN!  ***") ;
			}
		
		}
		
		function fillGrid(canvas,style,grid)
		{
		// ---------------------------------------------------------------------
		// Fill the grid with visible values, with appropriate styling depending 
		// on whether it is the main grid or a pattern/action grid.
		//
		// While drawing the grid, check whether all marked cells actually 
		// contain truffles
		// ---------------------------------------------------------------------
			
			var context = canvas.getContext("2d");
			
			context.fillStyle = "white"; 
			context.fillRect(0, 0, right-left, bottom-Top);
			context.fillStyle = style.fillColor; 
			context.fillRect(0, 0, grid[0].length*dh, grid.length*dv);
			context.font = "bold 20px Verdana";
			context.fillStyle = style.digitColor ;
		
			context.beginPath();

			for(var i=0; i<grid.length; i++)
				for(var j=0; j<grid[i].length; j++)
				{
					var text ;
	
					if(grid[i][j].visible)
					{
						if(grid[i][j].truffle)
						{
							context.fillStyle = style.explodedColor ;
							text = "X" ;
						}
						else
						{
							context.fillStyle = style.digitColor ;
							text = grid[i][j].val ;
						}
					
						var v = Top + dv*i + dv/2 ;
						var h = left + dh*j + dh/2 ;
// 						var width = context.measureText(grid[i][j].val).width;
						var width = context.measureText(text).width;
						var height = context.measureText("m").width ; //TOTAL KLUDGE - from Bespin;
						
						if(text==0)
						{
							context.fillStyle = style.emptyColor ;
							context.fillRect(left + j*dh + GRIDLINE_THICKNESS, 
											 Top  + i*dv + GRIDLINE_THICKNESS,
													dh,  
													dv);
							context.fillStyle = style.zeroColor ;
						}
						context.fillText(text,h-width/2,v + height/2 -3 ) ;
					}					

					if(grid[i][j].marked)
					{
						context.fillStyle = style.markedColor ; 
						context.fillRect(left+j*dh+GRIDLINE_THICKNESS, 
										 Top+i*dv+GRIDLINE_THICKNESS,
										 dh-2*GRIDLINE_THICKNESS, 
										 dv-2*GRIDLINE_THICKNESS);
					}
					
				}
		}
		
		function doMouseDown(event)
		{
		// ---------------------------------------------------------------------
		// Triggered when mouse event occurs inside canvas,
		// or when the Run button is clicked in DEVELOPER_MODE.
		// ---------------------------------------------------------------------
			if(gameOver)
				return ;
			
			var INVALID_RULES = !( rulesAreValid() );
			if(INVALID_RULES)
				return ;
				
			if( !(firstClick && DEVELOPER_RUN) )  // i.e., not triggered by "Run" button
			{						
				// Use clientX/clientY (viewport-relative) rather than pageX/pageY
				// (document-relative), since getBoundingClientRect() below is also
				// viewport-relative. Mixing the two caused clicks to be mapped to
				// the wrong cell whenever the page was scrolled.
				canvas_x = event.clientX ;
				canvas_y = event.clientY ;
	
				var bbox = canvas.getBoundingClientRect();
				canvas_x -= bbox.left ;
				canvas_y -= bbox.top ;
	
				ROW = Math.floor((canvas_y-Top)/dv) ;  // global
				COL = Math.floor((canvas_x-left)/dh) ;  // global
			}			
			if(firstClick)
			{
				doFirstClick(grid,ROW,COL);
				firstClick = false ;
			}
			
			var leftButton, rightButton;
			leftButton = 0 ; // if using Internet Explorer, it"s 1  (usingIE ? 1 : 0)
			rightButton = 2;

			// ---------------------------------------------------------------------
			// capture right button or ctrl-click to place marker
			// ---------------------------------------------------------------------
			if(event.button == rightButton || event.ctrlKey)  
			{
				placeMarker("You",grid,ROW,COL) ;
			}
			else if(event.button == leftButton)
			{
				probe("You",grid,ROW,COL) ;
			}
			
						
			fillGrid(canvas,gridStyle,grid) ;
			drawGrid(canvas,gridStyle,Top,left,bottom,right,dh,dv) ;
			checkForWin(canvas,grid)
			
			// ---------------------------------------------------------------------
			// The boar no longer moves automatically on every click -- that's now
			// "Next Move" / Auto Boar's job (see takeBoarTurn()). It still reacts
			// with a comment on what you just did, though.
			// ---------------------------------------------------------------------
			if(!SOLO_MODE)
			{
				if(grid[ROW][COL].marked)
					transcript("Ooohh... you marked " + grid[ROW][COL].name
								+ "!  Can I try it?") ;
				else if(grid[ROW][COL].visible)
					transcript("Ooohh... you probed " + grid[ROW][COL].name
								+" and it is near " 
								+ grid[ROW][COL].val
								+ " Truffle"
								+ (grid[ROW][COL].val==1 ? "" : "s")
								+ "!") ;
			}
		}
		
		
	// ---------------------------------------------------------------------
	// Draw empty grid on screen at start of session
	// ---------------------------------------------------------------------
		fillGrid(canvas,gridStyle,grid);
		drawGrid(canvas,gridStyle,Top,left,bottom,right,dh,dv) ;
		renderRuleBadges() ;