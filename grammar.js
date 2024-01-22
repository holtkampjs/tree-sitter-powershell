module.exports = grammar({
  name: 'powershell',

  extras: $ => [
    $._whitespace,
    $._comment,
  ],

  supertypes: _ => [],

  rules: {
    /*
    * ==============
    * 2.2.1 Scripts
    * ==============
    */

    /*
    * input:
    *     input-elements~opt~   signature-block~opt~
    * 
    * RENAME: input -> source_file
    */
    _source_file: $ => seq(
      optional($._input_elements),
      optional($._signature_block),
    ),

    /*
    * input-elements:
    *     input-element
    *     input-elements   input-element
    */
    _input_elements: $ => repeat1($._input_element),

    /*
    * input-element:
    *     whitespace
    *     comment
    *     token
    */
    _input_element: $ => choice(
      $._whitespace,
      $._comment,
      $._token,
    ),

    /*
    * signature-block:
    *     signature-begin   signature   signature-end
    */
    _signature_block: $ => seq(
      $._signature_begin,
      $._signature,
      $._signature_end,
    ),

    /*
    * signature-begin:
    *     new-line-character   # SIG # Begin signature block   new-line-character
    */
    _signature_begin: $ => seq(
      $._new_line_character,
      '# SIG # Begin signature block',
      $._new_line_character,
    ),

    /*
    * signature:
    *     base64 encoded signature blob in multiple single-line-comments
    */
    _signature: _ => repeat1(seq('#', /[A-Za-z0-9+/=]+/)),

    /*
    * signature-end:
    *     new-line-character   # SIG # End signature block   new-line-character
    */
    _signature_end: $ => seq(
      $._new_line_character,
      '# SIG # End signature block',
      $._new_line_character,
    ),

    /*
    * =======================
    * 2.2.2 Line terminators
    * =======================
    */

    /*
    * new-line-character:
    *     Carriage return character (U+000D)
    *     Line feed character (U+000A)
    *     Carriage return character (U+000D) followed by line feed character (U+000A)
    */
    _new_line_character: _ => choice(
      /\u000D/,
      /\u000A/,
      /\u000D\u000A/, // TODO: replace with seq()? possibly prec()?
    ),

    /*
    * new-lines:
    *     new-line-character
    *     new-lines new-line-character
    */
    _new_lines: $ => repeat1($._new_line_character),

    /*
    * ===============
    * 2.2.3 Comments
    * ===============
    */

    /*
    * comment:
    *     single-line-comment
    *     requires-comment
    *     delimited-comment
    */
    _comment: $ => choice(
      $._single_line_comment,
      $._requires_comment,
      $._delimited_comment,
    ),

    /*
    * single-line-comment:
    *     # input-characters~opt~
    */
    _single_line_comment: $ => seq(
      '#',
      optional($._input_characters),
    ),

    /*
    * input-characters:
    *     input-character
    *     input-characters input-character
    */
    _input_characters: $ => repeat1($._input_character),

    /*
    * input-character:
    *     Any Unicode character except a new-line-character
    */
    _input_character: _ => /[^\u000A\u000D]/,

    /*
    * requires-comment:
    *     #requires whitespace command-arguments
    */
    _requires_comment: $ => seq(
      '#requires',
      $._whitespace,
      $._command_arguments,
    ),

    /*
    * dash:
    *     - (U+002D)
    *     EnDash character (U+2013)
    *     EmDash character (U+2014)
    *     Horizontal bar character (U+2015)
    */
    _dash: _ => /[\u002D\u2013\u2014\u2015]/,

    /*
    * dashdash:
    *     dash dash
    */
    _dashdash: $ => seq($._dash, $._dash),

    /*
    * delimited-comment:
    *     < # delimited-comment-text~opt~ hashes >
    */
    _delimited_comment: $ => seq(
      '<',
      '#',
      optional($._delimited_comment_text),
      $._hashes,
      '>'
    ),

    /*
    * delimited-comment-text:
    *     delimited-comment-section
    *     delimited-comment-text delimited-comment-section
    */
    _delimited_comment_text: $ => choice(
      $._delimited_comment_section,
      seq($._delimited_comment_text, $._delimited_comment_section),
    ),

    /*
    * delimited-comment-section:
    *     >
    *     hashes~opt~  not-greater-than-or-hash
    */
    _delimited_comment_section: $ => choice(
      '>',
      seq(optional($._hashes), $._not_greater_than_or_hash),
    ),

    /*
    * hashes:
    *     #
    *     hashes #
    */
    _hashes: _ => /#+/,

    /*
    * not-greater-than-or-hash:
    *     Any Unicode character except > or #
    */
    _not_greater_than_or_hash: _ => /[^>#]/,

    /*
    * =================
    * 2.2.4 Whitespace
    * =================
    */

    /*
    * whitespace:
    *     Any character with Unicode class Zs, Zl, or Zp
    *     Horizontal tab character (U+0009)
    *     Vertical tab character (U+000B)
    *     Form feed character (U+000C)
    *     ` (The backtick character U+0060) followed by new-line-character
    */
    _whitespace: $ => choice(
      /[\p{Zs}\p{Zl}\p{Zp}\u0009\u000B\u000C]/,
      seq(/\u0060/, $._new_line_character),
    ),

    /*
    * ===========
    * 2.3 Tokens
    * ===========
    *
    * token:
    *     keyword
    *     variable
    *     command
    *     command-parameter
    *     command-argument-token
    *     integer-literal
    *     real-literal
    *     string-literal
    *     type-literal
    *     operator-or-punctuator
    */
    _token: $ => choice(
      $.keyword,
      $.variable,
      $.command,
      $.command_parameter,
      $.command_argument_token,
      $.integer_literal,
      $.real_literal,
      $.string_literal,
      $.type_literal,
      $.operator_or_punctuator,
    ),

    /*
    * ===============
    * 2.3.1 Keywords
    * ===============
    */

    /*
    * keyword: one of
    *     begin          break          catch       class
    *     continue       data           define      do
    *     dynamicparam   else           elseif      end
    *     exit           filter         finally     for
    *     foreach        from           function    if
    *     in             inlinescript   parallel    param
    *     process        return         switch      throw
    *     trap           try            until       using
    *     var            while          workflow
    */
    keyword: _ => choice(
      'begin',
      'break',
      'catch',
      'class',
      'continue',
      'data',
      'define',
      'do',
      'dynamicparam',
      'else',
      'elseif',
      'end',
      'exit',
      'filter',
      'finally',
      'for',
      'foreach',
      'from',
      'function',
      'if',
      'in',
      'inlinescript',
      'parallel',
      'param',
      'process',
      'return',
      'switch',
      'throw',
      'trap',
      'try',
      'until',
      'using',
      'var',
      'while',
      'workflow',
    ),

    /*
    * ===============
    * 2.3.1 Keywords
    * ===============
    */

    /*
    * variable:
    *     $$
    *     $?
    *     $^
    *     $   variable-scope~opt~  variable-characters
    *     @   variable-scope~opt~  variable-characters
    *     braced-variable
    */

    /*
    * braced-variable:
    *     ${   variable-scope~opt~   braced-variable-characters   }
    */

    /*
    * variable-scope:
    *     global:
    *     local:
    *     private:
    *     script:
    *     using:
    *     workflow:
    *     variable-namespace
    */

    /*
    * variable-namespace:
    *     variable-characters   :
    */

    /*
    * variable-characters:
    *     variable-character
    *     variable-characters   variable-character
    */

    /*
    * variable-character:
    *     A Unicode character of classes Lu, Ll, Lt, Lm, Lo, or Nd
    *     _   (The underscore character U+005F)
    *     ?
    */

    /*
    * braced-variable-characters:
    *     braced-variable-character
    *     braced-variable-characters   braced-variable-character
    */

    /*
    * braced-variable-character:
    *     Any Unicode character except
    *         }   (The closing curly brace character U+007D)
    *         `   (The backtick character U+0060)
    *     escaped-character
    */

    /*
    * escaped-character:
    *     `   (The backtick character U+0060) followed by any Unicode character
    */
  }
});
