module.exports = grammar({
  name: 'powershell',

  extras: $ => [
    /\s/,
    $.comment
  ],

  supertypes: _ => [],

  rules: {
    source_file: $ => seq($._token),

    _token: $ => choice(
      $.keyword,
      $.variable,
      $.command,
      $.command_parameter,
      // command-argument-token
      // integer-literal
      // real-literal
      // string-literal
      // type-literal
      // operator-or-punctuator
    ),

    keyword: $ => choice(
      $.begin,
      $.break,
      $.catch,
      $.class,
      $.continue,
      $.data,
      $.define,
      $.do,
      $.dynamicparam,
      $.else,
      $.elseif,
      $.end,
      $.exit,
      $.filter,
      $.finally,
      $.for,
      $.foreach,
      $.from,
      $.function,
      $.if,
      $.in,
      $.inlinescript,
      $.parallel,
      $.param,
      $.process,
      $.return,
      $.switch,
      $.throw,
      $.trap,
      $.try,
      $.until,
      $.using,
      $.var,
      $.while,
      $.workflow,
    ),

    begin: _ => 'begin',
    break: _ => 'break',
    catch: _ => 'catch',
    class: _ => 'class',
    continue: _ => 'continue',
    data: _ => 'data',
    define: _ => 'define',
    do: _ => 'do',
    dynamicparam: _ => 'dynamicparam',
    else: _ => 'else',
    elseif: _ => 'elseif',
    end: _ => 'end',
    exit: _ => 'exit',
    filter: _ => 'filter',
    finally: _ => 'finally',
    for: _ => 'for',
    foreach: _ => 'foreach',
    from: _ => 'from',
    function: _ => 'function',
    if: _ => 'if',
    in: _ => 'in',
    inlinescript: _ => 'inlinescript',
    parallel: _ => 'parallel',
    param: _ => 'param',
    process: _ => 'process',
    return: _ => 'return',
    switch: _ => 'switch',
    throw: _ => 'throw',
    trap: _ => 'trap',
    try: _ => 'try',
    until: _ => 'until',
    using: _ => 'using',
    var: _ => 'var',
    while: _ => 'while',
    workflow: _ => 'workflow',

    variable: $ => choice(
      seq(
        '$',
        choice(
          '$',
          '?',
          '^',
          seq(
            optional($._variable_scope),
            $.identifier
          ),
          seq(
            '{',
            optional($._variable_scope),
            $.identifier,
            '}'
          ),
        ),
      ),
      seq(
        '@',
        optional($._variable_scope),
        $.identifier
      ),
    ),

    // Valid characters to match variable names
    identifier: _ => /[A-Za-z0-9_\?]+/,

    // Valid characters for braced variable names
    braced_identifier: _ => /[^\}`]+/,

    _variable_scope: $ => seq($.scope, ':'),

    scope: _ => choice(
      'global',
      'local',
      'private',
      'script',
      'using',
      'workflow',
      /[A-Za-z0-9_\?]+/,
    ),

    // TODO: Implement tests
    command: $ => $._generic_token,
    _generic_token: $ => repeat1($._generic_token_part),
    _generic_token_part: $ => choice(
      // TODO: expandable-string-literal
      // TODO: verbatim-here-string-literal
      $.variable,
      /[^\{\}\(\)\;\,\|\&\$\`\"\']/,
    ),
    _generic_token_with_subexpr_start: $ => seq(
      repeat1($._generic_token_part),
      '$(',
    ),

    /*
    * command-parameter:
    *     dash first-parameter-char parameter-chars colon~opt~
    * 
    * first-parameter-char:
    *     A Unicode character of classes Lu, Ll, Lt, Lm, or Lo
    *     _ (The underscore character U+005F)
    *     ?
    * 
    * parameter-chars:
    *     parameter-char
    *     parameter-chars parameter-char
    * 
    * parameter-char:
    *     Any Unicode character except
    *         { } ( ) ; , \| & . [
    *         colon
    *         whitespace
    *         new-line-character
    * 
    * colon:
    *     : (The colon character U+003A)
    * 
    * // TODO: Continue
    * verbatim-command-argument-chars:
    *     verbatim-command-argument-part
    *     verbatim-command-argument-chars verbatim-command-argument-part
    * 
    * verbatim-command-argument-part:
    *     verbatim-command-string
    *     & non-ampersand-character
    *     Any Unicode character except
    *         |
    *         new-line-character
    * 
    * non-ampersand-character:
    *     Any Unicode character except &
    * 
    * verbatim-command-string:
    *     double-quote-character non-double-quote-chars
    *     double-quote-character
    * 
    * non-double-quote-chars:
    *     non-double-quote-char
    *     non-double-quote-chars non-double-quote-char
    * 
    * non-double-quote-char:
    *     Any Unicode character except
    *         double-quote-character
    */

    common_parameter: _ => seq(
      '-',
      /[A-Za-z_\?]/,
      /[^\{\}\(\)\;\,\|\&\.\[\:\s]*/,
      optional(':'),
    ),

    // TODO: Implement tests
    comment: _ => token(choice(
      seq('#', /.*/),
      seq(
        '<#',
        /.*/,
        '#>',
      ),
    )),
  }
});
