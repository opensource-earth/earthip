<%@page contentType="text/json;charset=gb2312"%> 
<%@page import="java.sql.*"%>
<%@page import="java.util.*"%>

<% 
try{ 
  Class.forName("sun.jdbc.odbc.JdbcOdbcDriver");
} 
catch(ClassNotFoundException e){ 
  out.print(e); 
} 
try{ 
  String url = "jdbc:odbc:test"; 
  Connection conn = DriverManager.getConnection(url,"",""); 
  Statement stmt = conn.createStatement(); 
  ResultSet rs = stmt.executeQuery("Select * FROM s2");

  HashMap<String, ArrayList<String>> dic = new HashMap<String, ArrayList<String>>();
  while(rs.next()){
    String attIp = rs.getString(3);
    String vicIp = rs.getString(4);

    ArrayList<String> array = null;
    if (dic.containsKey(attIp)) {
       array = dic.get(attIp);
    } else {
       array = new ArrayList<String>();
       dic.put(attIp, array);
    }
    array.add(vicIp);
  } 
  rs.close(); 
  stmt.close(); 
  conn.close();

  
    Iterator iter = dic.entrySet().iterator();

String outputStr ="{";
while(iter.hasNext()) {
Map.Entry entry = (Map.Entry) iter.next();
String key = (String)entry.getKey();
ArrayList<String> val = (ArrayList<String>)entry.getValue();
outputStr += ("\"" + key + "\" : [");
for (int idx = 0; idx < (val.size() - 1); idx ++) {
String ip = val.get(idx);
outputStr += ("\"" + ip + "\",");
}
outputStr += ("\"" + val.get(val.size() - 1) + "\"],");
}
outputStr = outputStr.substring(0, outputStr.length() - 1) + "}";

out.print(outputStr);
} 
catch(Exception ex){ 
  out.print(ex); 
} 


%>
