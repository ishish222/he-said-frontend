use super::method::{Method, MethodError};
use std::{
    convert::{
        TryFrom,
        From,
    },
    error::Error,
    fmt::{
        Display,
        Debug,
        Result as FmtResult,
        Formatter,
    },
    str,
    str::Utf8Error,
};

pub struct Request {
    path: String,
    query_string: Option<String>,
    method: Method,
}

impl TryFrom<&[u8]> for Request {
    type Error = ParseError;

    // GET /search?name=abc?sort=1 HTTP/1.1

    fn try_from(buf: &[u8]) -> Result<Self, Self::Error> {

        let request = str::from_utf8(buf)?;

        let (method, request) = get_next_word(request).ok_or(ParseError::InvalidRequest)?;
        let (mut path, request) = get_next_word(request).ok_or(ParseError::InvalidRequest)?;
        let (protocol, _) = get_next_word(request).ok_or(ParseError::InvalidRequest)?;

        if protocol != "HTTP/1.1" {
            return Err(ParseError::InvalidProtocol);
        }

        let method : Method = method.parse()?;

        let mut query_string = None;

        if let Some(i) = path.find('?')  {
            query_string = Some(path[i+1..].to_string());            
            path = &path[..i];
        }

        Ok(Self {
            path: path.to_string(),
            query_string,
            method,
        })
    }
}

fn get_next_word(s: &str) -> Option<(&str, &str)> {
    
    for (i, c) in s.chars().enumerate() {
        if c == ' ' || c == '\r' {
            return Some((&s[..i], &s[i+1..]));
        }
    }

    None
}

pub enum ParseError {
    InvalidRequest,
    InvalidEncoding,
    InvalidProtocol,
    InvalidMethod,
}

impl ParseError {
    fn message(&self) -> &str {
        match self {
            Self::InvalidRequest => "InvalidRequest", 
            Self::InvalidEncoding => "InvalidEncoding ",
            Self::InvalidProtocol => "InvalidEncoding ",
            Self::InvalidMethod => "InvalidEncoding ",
        }
    }
}

impl Display for ParseError {
    fn fmt(&self, f: &mut Formatter<'_>) -> FmtResult {
        write!(f, "{}", self.message())
    }
}

impl Debug for ParseError {
    fn fmt(&self, f: &mut Formatter<'_>) -> FmtResult {
        write!(f, "{}", self.message())
    }
}

impl From<Utf8Error> for ParseError {
    fn from(_: Utf8Error) -> Self {
        Self::InvalidEncoding
    }
} 

impl From<MethodError> for ParseError {
    fn from(_: MethodError) -> Self {
        Self::InvalidEncoding
    }
} 

impl Error for ParseError {

}