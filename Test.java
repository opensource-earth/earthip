import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.io.Reader;

public class Test {

	public static void main(String[] args) {
		File readfile = new File(args[0]);
		File writefile = new File(args[1]);
		
		try {
			FileInputStream fis = new FileInputStream(readfile);
			byte[] b = new byte[fis.available()];
			StringBuilder str = new StringBuilder();
			fis.read(b);
			for (byte bs : b) {
				str.append(Integer.toString(bs) + ",");
			}
			fis.close();
			
			FileWriter fw = new FileWriter(writefile);
			fw.write(str.toString());
			fw.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/*public static void main(String[] args) {
		File readfile = new File(args[0]);
		File writefile = new File(args[1]);
		Reader reader = null;
		FileWriter fw = null;

		try {
			reader = new InputStreamReader(new FileInputStream(readfile));
			fw = new FileWriter(writefile);

			char buffer[] = new char[8];
			int readByte = 0;
			while ((readByte = reader.read(buffer)) == 8) {
				fw.write(String.format("%d,%d,%d,%d,%d,%d,%d,%d,",
						Integer.toString(buffer[0]),
						Integer.toString(buffer[1]),
						Integer.toString(buffer[2]),
						Integer.toString(buffer[3]),
						Integer.toString(buffer[4]),
						Integer.toString(buffer[5]),
						Integer.toString(buffer[6]),
						Integer.toString(buffer[7])));
			}

			for (int idx = 0; idx < readByte; idx++) {
				fw.write(String.format("%d,", Integer.toString(buffer[idx])));
			}

			fw.close();
			reader.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}*/

}
